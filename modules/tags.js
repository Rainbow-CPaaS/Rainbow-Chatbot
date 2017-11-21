"use strict";

const getHashTags = require("./hashtag");
const Message = require("./message");

const LOG_ID = "TAGS - ";

class Tags {

    constructor(json) {
        this._tags = json;
        this._logger = null;
        this._event = null;
    }

    log(level, message, content) {
        if(this._logger) {
            this._logger.log(level, message);
        } else {
            console.log(message, content);
        }
    }

    start(event, logger) {
        
        let that = this;

        return new Promise((resolve) => {
            that._logger = logger;
            that.log("debug", LOG_ID + "start() - Enter");
            that._event = event;
            that.log("debug", LOG_ID + "start() - Exit");
            resolve();
        });
    }

    isDefined(tag) {
        if(this._tags) {
            return (tag in this._tags);
        }
        return false;
    }

    get listOfTags() {
        return this._tags;
    }

    qualify(msg) {
        let tags = getHashTags(msg.value);
        let foundOrEmpty = false;

        while(!foundOrEmpty) {
            let tag = tags.pop();
            if(!tag) {
                foundOrEmpty = true;
            }
            else {
                if(this.isDefined(tag)) {
                    msg.tag = tag;
                    msg.type = Message.MESSAGE_TYPE.COMMAND;
                    foundOrEmpty = true;
                }
            }
        }

        if(msg.tag && (msg.tag in this._tags)) {
            return this._tags[msg.tag];
        }

        return null;
    }
}

module.exports = Tags;