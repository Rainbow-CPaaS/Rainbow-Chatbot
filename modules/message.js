"use strict";

class Message {

    // This class is used to debounce messages that come to the bot to allow a better scalling
    constructor(json) {
        this._value = (json && json.value) ? json.value : "";
        this._date = (json && json.date) ? json.date : new Date();
        this._jid = (json && json.jid) ? json.jid : "";
        this._lang =(json && json.lang) ? json.lang : "en";
        this._type = (json && json.type) ? json.type : "message";
        this._tag = (json && json.tag) ? json.tag : null;
        this._from = (json && json.from) ? json.from : null;
    }

    get jid() {
        return this._jid;
    }

    get type() {
        return this._type;
    }

    get date() {
        return this._date;
    }

    get tag() {
        return this._tag;
    }

    get lang() {
        return this._lang;
    }

    get value() {
        return this._value;
    }

    get from() {
        return this._from;
    }

    set value(_value) {
        this._value = _value;
    }

    set jid(_jid) {
        this._jid = _jid;
    }

    set lang(_lang) {
        this._lang = _lang;
    }

    set type(_type) {
        this._type = _type;
    }

    set tag(_tag) {
        this._tag = _tag;
    }

    set from(_from) {
        this._from = _from;
    }

    hasTag() {
        return Boolean(this._tag);
    }
} 

module.exports = Message;

Message.MESSAGE_TYPE = {
    "MESSAGE": "message",
    "COMMAND": "command"
};