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

        this._event = event;
        this._logger = logger;

        return new Promise((resolve, reject) => {
            this.listenToSDKError();
            this.listenToIncomingMessage();
            this.listenToOutgoingMessage();
            resolve();
        });
    }

    listenToSDKError() {
        this._nodeSDK.events.once("rainbow_onerror", (jsonMessage) => {
            this._logger.log("debug", LOG_ID + "listenToSDKError() - Error!", jsonMessage);
        });
    }

    listenToIncomingMessage() {
        this._nodeSDK.events.on("rainbow_onmessagereceived", (message) => {
            this._nodeSDK.im.markMessageAsRead(message);

            this.getContact(message.fromJid).then(contact => {
                let msg = new Message({
                    type: Message.MESSAGE_TYPE.MESSAGE,
                    jid: message.fromJid,
                    from: contact,
                    value: message.content,
                    lang: message.lang,
                    date: new Date()
                });

                this._logger.log("debug", LOG_ID + "listenToIncomingMessage() - Received " + msg.type);
                
                this._event.emit("onmessagereceived", msg);
            });
        });

        this._nodeSDK.events.on("rainbow_onmessagereceiptreceived", (receipt) => {
            this._event.emit("onreceiptreceived", receipt);
        });
    }

    listenToOutgoingMessage() {
        this._event.on("onSendMessage", (json) => {
            this.sendAMessage(json.message, json.jid, json.type, json.messageMarkdown);
        });
    }

    getContact(jid) {

        this._logger.log("debug", LOG_ID + "getContact() - Enter");

        return new Promise((resolve, reject) => {
            if (!(jid in this._usersCache)) {
                // get information on the contact by Jid
                this._nodeSDK.contacts.getContactByJid(jid).then((user) => {
                    this._usersCache[jid] = user;
                    this._logger.log("info", LOG_ID + "getContact() - Found on server");
                    this._logger.log("debug", LOG_ID + "getContact() - Exit");
                    resolve(user);
                }).catch((err) => {
                    this._logger.log("error", LOG_ID + "getContact() - Error", err);
                    this._logger.log("debug", LOG_ID + "getContact() - Exit");
                    reject(err);
                });

            } else {
                this._logger.log("debug", LOG_ID + "getContact() - Found in cache");
                this._logger.log("debug", LOG_ID + "getContact() - Exit");
                resolve(this._usersCache[jid]);
            }
        });
    }

    getContactById(id) {

        this._logger.log("debug", LOG_ID + "getContactById() - Enter");

        return new Promise((resolve, reject) => {
            // get information on the contact by ID
            this._nodeSDK.contacts.getContactById(id).then((user) => {
                this._logger.log("info", LOG_ID + "getContactById() - Found");
                this._logger.log("debug", LOG_ID + "getContactById() - Exit");
                resolve(user);
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "getContactById() - Error", err);
                this._logger.log("debug", LOG_ID + "getContactById() - Exit");
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