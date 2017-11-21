"use strict";

const LOG_ID = "SDK - ";

const Message = require('./message');

class SDK {

    constructor(nodeSDK) {
        this._nodeSDK = nodeSDK;
        this._event = null;
        this._logger = null;
        this._usersCache = {};
    }

    start(event, logger) {

        let that = this;

        this._event = event;
        this._logger = logger;

        return new Promise(function(resolve, reject) {

            that._nodeSDK.events.once("rainbow_onerror", (jsonMessage) => {
                that._logger.log("debug", LOG_ID + "start() - Error!");
                reject(jsonMessage);
            });

            that._nodeSDK.events.once("rainbow_onready", (jsonMessage) => {
                that._logger.log("debug", LOG_ID + "start() - Successfull!");
                resolve(jsonMessage);
            });

            //that.listenToPresenceChange();
            that.listenToIncomingMessage();
            that.listenToOutgoingMessage();

            that._nodeSDK.start();
        });
    }

    listenToIncomingMessage() {
        let that = this;

        this._nodeSDK.events.on("rainbow_onmessagereceived", (message) => {
            that._nodeSDK.im.markMessageAsRead(message);

            that.getContact(message.fromJid).then(contact => {
                let msg = new Message({
                    type: Message.MESSAGE_TYPE.MESSAGE,
                    jid: message.fromJid,
                    from: contact,
                    value: message.content,
                    lang: message.lang,
                    date: new Date()
                });

                that._logger.log("debug", LOG_ID + "listenToIncomingMessage() - Received " + msg.type);
                
                that._event.emit("onmessagereceived", msg);
            });

        });

        this._nodeSDK.events.on("rainbow_onmessagereceiptreceived", function(receipt) {
            that._event.emit("onreceiptreceived", receipt);
        });
    }

    listenToOutgoingMessage() {
        let that = this;

        this._event.on("onSendMessage", (json) => {
            that.sendAMessage(json.message, json.jid, json.type, json.messageMarkdown);
        });
    }

    getContact(jid) {

        let that = this;

        that._logger.log("debug", LOG_ID + "getContact() - Enter");

        return new Promise((resolve, reject) => {
            if (!(jid in that._usersCache)) {
                // get information on that player
                that._nodeSDK.contacts.getContactByJid(jid).then((user) => {
                    that._usersCache[jid] = user;
                    that._logger.log("info", LOG_ID + "getContact() - Found on server");
                    that._logger.log("debug", LOG_ID + "getContact() - Exit");
                    resolve(user);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "getContact() - Error", err);
                    that._logger.log("debug", LOG_ID + "getContact() - Exit");
                    reject(err);
                });

            } else {
                that._logger.log("debug", LOG_ID + "getContact() - Found in cache");
                that._logger.log("debug", LOG_ID + "getContact() - Exit");
                resolve(that._usersCache[jid]);
            }
        });
    }

    getContactById(id) {

        let that = this;

        that._logger.log("debug", LOG_ID + "getContactById() - Enter");

        return new Promise((resolve, reject) => {
            // get information on that player
            that._nodeSDK.contacts.getContactById(id).then((user) => {
                that._logger.log("info", LOG_ID + "getContactById() - Found");
                that._logger.log("debug", LOG_ID + "getContactById() - Exit");
                resolve(user);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "getContactById() - Error", err);
                that._logger.log("debug", LOG_ID + "getContactById() - Exit");
                reject(err);
            });
        });
    }

    sendAMessage(message, jid, type, messageMarkdown) {

        let markdown = null;
        if (messageMarkdown) {
            markdown = {
                "type": "text/markdown",
                "message": messageMarkdown 
            }
        }

        this._nodeSDK.im.sendMessageToJid(message, jid, "en", markdown, type);
    }

}

module.exports = SDK;