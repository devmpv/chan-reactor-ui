import {Label, OverlayTrigger, Button, Badge} from 'react-bootstrap';
import settings from '../static/settings.json';

const React = require('react');
const srcPath = settings['chan-reactor'].hostUrl+'/src/attach/';
const thumbPath = srcPath+'thumbs/';

export const CHeader = ({message, controls}) => (
  <div className="message-header">
      <span className="message-title">{message.title}</span>&nbsp;
      <Label bsStyle="success">Anonymous</Label>&nbsp;
      <Label bsStyle="info">{new Date(message.timestamp).toLocaleString()}</Label>&nbsp;
      <a name={message.id} href={'#'+message.id}>{'№'+message.id}</a>&nbsp;
      {controls}
  </div>
);

export const CThreadCtrl = ({thread}) => {
  let badgeCount = thread.count-3 > 0 ? thread.count-3 : 0;
  return(<span>
    <Button bsSize="xsmall" bsStyle="default">-</Button>&nbsp;
    <Button bsSize="xsmall" bsStyle="primary" href={'/' + thread.board + "/thread/" + thread.id}>Open</Button>
    {badgeCount > 0 ? <Badge title="Omitted replies" >{badgeCount}</Badge> : null}
  </span>
)};

export const CThumbs = ({attachments, onThumbClick}) => {
  let thumbs = <div/>;
  if (attachments.length > 1) {
    thumbs = attachments.map(attach =>
      <div key={attach.name} className="thumb-box item"><img className="thumb" src={thumbPath+attach.name} id={attach.name} alt="thumb" onClick={onThumbClick}/></div>
    );
  }else {
    if (attachments.length > 0) thumbs = <img className="thumb" src={thumbPath+attachments[0].name} id={attachments[0].name} alt="thumb" onClick={onThumbClick}/>
  }
  return(
      <div className="thumb-box">{thumbs}</div>
)};

export const CTrigger = ({messageId, render}) => {
  return(
    <OverlayTrigger rootClose trigger={['hover']} delayHide={5000} overlay={render(messageId)}>
      <a href={'#'+messageId}>{'>>'+messageId}</a>
    </OverlayTrigger>
)};

export const CMessage = ({message, controls, styleName, replies}) => {
  let repl = [];
  for (let key in replies) {
    repl.push(replies[key]);
  }
  return(
    <div className="post-wrapper">
      <div className={styleName}>
        <CHeader message={message} controls={controls}/>
        <div className="message-body">
          {message.thumbs}
          <blockquote id="message-text" className="message-text">{message.text}</blockquote>
        </div>
        {repl.length > 0 ? <div className="replies">Replies: {repl}</div> : null}
      </div>
    </div>
)};

export const CThread = ({thread, replies}) => {
  let messages = [];
  for (let key in thread.messages) {
    let message = thread.messages[key];
    messages.push(<CMessage key={message.id} message={message} controls={<div/>} styleName="message" replies={replies[message.id.toString()]}/>);
  }
  return(
    <div>
      <CMessage message={thread} controls={<CThreadCtrl thread={thread}/>} styleName="op" replies={replies[thread.id.toString()]}/>
        {messages}
      <hr className="hr"/>
    </div>
)};
