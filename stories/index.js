import React from "react";

import "./../src/static/css/main.css";
import "./../src/static/css/bootstrap.min.css";

import {storiesOf} from "@storybook/react";
import {CMessage} from "./../src/components/Components";
import {text, withKnobs, object} from "@storybook/addon-knobs";

const stories = storiesOf('CMessage', module);
stories.addDecorator(withKnobs);
stories.add('simple', () => {
    const defaultMessage = {
        "text": "<p>&gt;&gt;1 &gt;&gt;1 &gt;&gt;2</p>\r\n",
        "timestamp": 1505668346555,
        "replyIds": [
            3,
            4,
            5,
            6,
            7,
            8
        ],
        "attachments": [],
        "title": "12",
        "updated": 1505668346555,
        "id": 2,
        "_links": {
            "self": {
                "href": "http://localhost:9090/rest/api/messages/2"
            },
            "message": {
                "href": "http://localhost:9090/rest/api/messages/2{?projection}",
                "templated": true
            },
            "replies": {
                "href": "http://localhost:9090/rest/api/messages/2/replies"
            },
            "thread": {
                "href": "http://localhost:9090/rest/api/messages/2/thread"
            },
            "attachments": {
                "href": "http://localhost:9090/rest/api/messages/2/attachments"
            },
            "replyTo": {
                "href": "http://localhost:9090/rest/api/messages/2/replyTo"
            }
        }
    };
    const message = object('message', defaultMessage);
    return (<CMessage message={message} controls={<div/>} styleName={'message'}
                      replies={{}}/>);
});