import {Breadcrumb, Button, Popover} from "react-bootstrap";
import CreateDialog from "./CreateDialog";
import ContentViewer from "./ContentViewer";
import {CMessage, CThread, CThumbs, CTrigger} from "./Components";
import Parser from "html-react-parser";
import {custom, search} from "../client/api";
import settings from "../static/settings.json";

const React = require('react');

const srcPath = settings['chan-reactor'].hostUrl + '/src/attach/';

class BoardPage extends React.Component {

    state = {
        items: [],
        replies: {},
        pageSize: 20,
        createDialog: false,
        content: {
            src: "/static/img/redo.png",
            visible: false
        }};

    render() {
        let threadPrev = this.state.items.map(thread =>
            <CThread key={thread.id} thread={thread} replies={this.state.replies}/>
        );
        return (
            <div className="chan-style">
                <Breadcrumb>
                    <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
                    <Breadcrumb.Item active
                                     href={"/" + this.props.match.params.boardName}>{this.props.match.params.boardName}</Breadcrumb.Item>
                    <Breadcrumb.Item active={false}><Button onClick={this.onOpen} bsStyle="success" bsSize="xsmall">Create</Button></Breadcrumb.Item>
                </Breadcrumb>
                {threadPrev}
                <CreateDialog visible={this.state.createDialog}
                              onClose={this.onClose}
                              boardName={this.props.match.params.boardName}
                              onCreate={this._onCreate}/>
                <ContentViewer content={this.state.content} onThumbClick={this._onThumbClick}/>
            </div>
        )
    }

    constructor(props) {
        super(props);
        this._updatePageSize = this._updatePageSize.bind(this);
        this._onCreate = this._onCreate.bind(this);
        this._onThumbClick = this._onThumbClick.bind(this);
        this._onOpen = () => this.setState({createDialog: true});
        this._onClose = () => this.setState({createDialog: false});
        this._renderPopover = this._renderPopover.bind(this);
    }

    componentWillMount() {
        this._loadFromServer(this.state.pageSize);
    }

    _loadFromServer(pageSize) {
        this.setState({
            items: []
        });
        search('threads', 'findByBoardId', {
            size: pageSize,
            boardId: this.props.match.params.boardName
        }).then(json => {
            let threads = json._embedded['threads'];
            if (!threads) return;
            for (let index in threads) {
                this._getThreadDetails(threads[index], index);
            }
        });
    }

    _renderPopover(index, messageId) {
        messageId = messageId.toString();
        let thread = this.state.items[index];
        let message = thread.id.toString() === messageId ? thread : thread.messages[messageId];
        return (
            <Popover bsClass="popover-custom" id={messageId}>
                <CMessage message={message} controls={<div/>} styleName="message"
                          replies={this.state.replies[messageId]}/>
            </Popover>
        )
    }

    _createThumbs(message) {
        message.thumbs = <CThumbs attachments={message.attachments} onThumbClick={this._onThumbClick}/>;
        return message;
    }

    _parseText(message, thread, index) {
        let replies = this.state.replies;
        let renderPopover = this._renderPopover;
        message.text = Parser(message.text, {
            replace: function (domNode) {
                if (domNode.attribs && domNode.attribs.id === 'reply-link') {
                    if (thread.messages[domNode.attribs.key] || thread.id.toString() === domNode.attribs.key) {
                        let list = replies[domNode.attribs.key] ? replies[domNode.attribs.key] : {};
                        list[message.id.toString()] =
                            <CTrigger key={message.id} threadId={index} messageId={message.id} render={renderPopover}/>;
                        replies[domNode.attribs.key] = list;
                        return <CTrigger threadId={index} messageId={domNode.attribs.key} render={renderPopover}/>
                    } else {
                        return <span>{'>>' + domNode.attribs.key}</span>
                    }
                }
            }
        });
        this.setState({
            replies: replies
        });
        return message;
    }

    _getThreadDetails(thread, index) {
        thread = this._createThumbs(thread);
        thread.text = Parser(thread.text);
        thread.messages = {};
        thread.count = 0;
        thread.board = this.props.match.params.boardName;
        search('messages', 'preview', {id: thread.id})
            .then(preview => {
                for (let message of preview._embedded['messages'].reverse()) {
                    thread.messages[message.id.toString()] = message;
                }
                for (let key in thread.messages) {
                    thread.messages[key] = this._parseText(this._createThumbs(thread.messages[key]), thread, index);
                }
                search('messages', 'preview', {id: thread.id})
                    .then(count => {
                        let threads = this.state.items;
                        thread.count = count.entity;
                        threads[index] = thread;
                        this.setState({
                            items: threads
                        });
                    });
            });
    }

    _onCreate(form) {
        custom('/res/submit', {
            method: "POST",
            body: form,
            credentials: 'include'
        }).then(() => this._loadFromServer(this.state.pageSize));
    }

    _onThumbClick(event) {
        let attachName = event.target.id;
        let visible = this.state.content.visible;
        let src = srcPath + attachName;
        if (this.state.content.visible) {
            if (this.state.content.src === src || attachName === '') {
                visible = false;
                src = "/static/img/redo.png";
            }
        } else {
            visible = true;
        }
        this.setState({
            content: {
                src: src,
                visible: visible
            }
        });
    }

    _updatePageSize(pageSize) {
        if (pageSize !== this.state.pageSize) {
            this._loadFromServer(pageSize);
        }
    }
}

export default BoardPage;
