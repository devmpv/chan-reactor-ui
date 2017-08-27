import {Badge, Breadcrumb, Button, Popover} from "react-bootstrap";
import CreateDialog from "./CreateDialog";
import ContentViewer from "./ContentViewer";
import {CMessage, CThread, CThumbs, CTrigger} from "./Components";
import Parser from "html-react-parser";
import {register} from "../client/websocket-listener";
import {custom, entity, search} from "../client/api";
import settings from "../static/settings.json";

const React = require('react');

const srcPath = settings['chan-reactor'].hostUrl + '/src/attach/';

class ThreadPage extends React.Component {

    state = {
        thread: {},
        createDialog: false,
        replies: {},
        pageSize: 500,
        newCount: 0,
        content: {
            src: "/static/img/redo.png",
            visible: false
        }
    };

    render() {
        let params = this.props.match.params;
        let thread = this.state.thread;
        let threadView = thread.id ? <CThread key={thread.id} thread={thread} replies={this.state.replies}/> : null;
        return (
            <div className="chan-style">
                <Breadcrumb>
                    <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
                    <Breadcrumb.Item href={"/" + params.boardName}>{params.boardName}</Breadcrumb.Item>
                    <Breadcrumb.Item active
                                     href={"/" + params.boardName + "/thread/" + params.threadId}>{'#' + params.threadId}</Breadcrumb.Item>
                    <Breadcrumb.Item active={false}><Button onClick={this._onOpen} bsStyle="success" bsSize="xsmall">Reply</Button></Breadcrumb.Item>
                </Breadcrumb>
                {threadView}
                <CreateDialog visible={this.state.createDialog}
                              onClose={this._onClose}
                              threadId={params.threadId}
                              onCreate={this._onCreate}/>
                <ContentViewer content={this.state.content} onThumbClick={this._onThumbClick}/>
                <div className="newCount">
                    <Button bsStyle="primary" bsSize="xsmall" onClick={this._loadNew}>Refresh <Badge
                        title="New replies">{this.state.newCount}</Badge></Button>
                </div>
            </div>
        )
    }

    constructor(props) {
        super(props);
        this._onCreate = this._onCreate.bind(this);
        this._onThumbClick = this._onThumbClick.bind(this);
        this._newMessage = this._newMessage.bind(this);
        this._loadNew = this._loadNew.bind(this);
        this._onOpen = () => this.setState({createDialog: true});
        this._onClose = () => this.setState({createDialog: false});
        this._renderPopover = this._renderPopover.bind(this);
    }

    componentWillMount() {
        this._loadFromServer(this.state.pageSize);
        let headers = {selector: "headers['nativeHeaders']['thread'][0] == '" + this.props.match.params.threadId + "'"};
        register([
            {route: '/topic/newMessage', headers: headers, callback: this._newMessage}
        ]);
    }

    _loadFromServer(pageSize) {
        let thread;
        entity('threads', this.props.match.params.threadId, {projection: 'inlineAttachments'})
            .then(response => {
                thread = {
                    id: response.id,
                    attachments: response.attachments,
                    title: response.title,
                    text: response.text,
                    timestamp: response.timestamp,
                    updated: response.updated,
                    board: this.props.match.params.boardName,
                    messages: {}
                };
                thread = this._createThumbs(thread);
                thread.text = Parser(thread.text);
                search('messages', 'thread', {
                    size: pageSize,
                    id: this.props.match.params.threadId
                }).then(reply => {
                    let messages = reply._embedded['messages'] ? reply._embedded['messages'] : [];
                    for (let message of messages.reverse()) {
                        thread.messages[message.id.toString()] = message;
                    }
                    for (let key in thread.messages) {
                        thread.messages[key] = this._parseText(this._createThumbs(thread.messages[key]), thread, 0);
                    }
                    this.setState({
                        thread: thread,
                        pageSize: pageSize,
                        newCount: 0
                    })
                })
            });
    }

    _renderPopover(index, messageId) {
        messageId = messageId.toString();
        let thread = this.state.thread;
        let message = thread.id === messageId ? thread : thread.messages[messageId];
        return (
            <Popover bsClass="popover-custom" id={messageId}>
                <CMessage message={message} controls={<div/>} styleName={'message'}
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
            replace: (domNode) => {
                if (domNode.attribs && domNode.attribs.id === 'reply-link') {
                    if (thread.messages[domNode.attribs.key] || thread.id === domNode.attribs.key) {
                        let id_string = domNode.attribs.key.toString();
                        let list = replies[id_string] ? replies[id_string] : {};
                        list[message.id.toString()] =
                            <CTrigger key={message.id} threadId={index} messageId={message.id} render={renderPopover}/>;
                        replies[id_string] = list;
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

    _loadNew() {
        if (this.state.newCount === 0) {
            return;
        }
        if (!this.state.items) {
            this._loadFromServer(this.state.pageSize);
            return;
        }
        if (this.state.items.length <= 20) {
            this._loadFromServer(this.state.pageSize);
            return;
        }
        search('messages', 'thread', {
            size: this.state.items.length,
            page: 1,
            id: this.props.match.params.threadId
        }).then(response => {
            let msgList = response._embedded['messages'];
            if (!msgList) {
                return;
            }
            let items = this.state.items;
            items = items.concat(msgList);
            this.setState({
                items: items,
                newCount: this.state.newCount - msgList.length,
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
                src = "/img/redo.png";
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

    _newMessage(message) {
        this.setState({
            newCount: this.state.newCount + 1
        });
    }
}

export default ThreadPage;
