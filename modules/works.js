"use strict";

const Work = require("./work");
const Message = require("./message");

const LOG_ID = "WORKS - ";

class Works {

    constructor(nodeSDK) {
        this._event = null;
        this._logger = null;
        this._factory = null;
        this._nodeSDK = nodeSDK;
        this._works = [];
    }

    start(event, logger, factory) {
        
        let that = this;

        return new Promise((resolve) => {
            that._logger = logger;
            that.log("debug", LOG_ID + "start() - Enter");
            that._event = event;
            that._factory = factory;
            that.log("debug", LOG_ID + "start() - Exit");
            resolve();
        });
    }

    log(level, message, content) {
        if(this._logger) {
            this._logger.log(level, message);
        } else {
            console.log(message, content);
        }
    }

    get listOfWorks() {
        return this._works;
    }

    addWork(work) {
        this._works.push(work);
        this.log("debug", LOG_ID + "addWork() - number of work(s) " + this._works.length);
    }

    getWorkByJid(jid) {
        return this._works.find((work) => {
            return (work.jid === jid && !work.isFinished && !work.isAborted && !work.isBlocked);
        });
    }

    purge() {
        this._works.forEach((work) => {
            // purge opened tickets from the base when chatbot is stopped
            if( work.state === Work.STATE.INPROGRESS ||
                work.state === Work.STATE.NEW ||
                work.state === Work.STATE.BLOCKED ||
                work.state === Work.STATE.TERMINATED) {
                
                work.abort();
                this._event.emit("ontaskfinished", work);
            }
        });
    }

    getWork(message, scenario) {

        let createWork = (jid, tag, from, scenario) => {
            let work = new Work(this._event, this._logger, this._factory);
            work.jid = jid;
            work.tag = tag;
            work.from = from;
            work.scenario = scenario;
            return work;
        };

        let work = this.getWorkByJid(message.jid);

        // Create new work if tag + no existing work
        if (!work) {
            if (message.type === Message.MESSAGE_TYPE.COMMAND) {
                work = createWork(message.jid, message.tag, message.from, scenario);
                this.log("debug", LOG_ID + "getWork() - Create new work " + work.id + " | " + work.tag);
                this.addWork(work);
            } else {
                this.log("warn", LOG_ID + "getWork() - No existing work found for that message");
            }
        // Reuse existing work
        } else {
            // If command send, abort current work and create a new one
            if(message.type === "command") {
                work.abort();
                work = createWork(message.jid, message.tag, message.from, scenario);
                this.log("debug", LOG_ID + "getWork() - Create new work " + work.id + " | " + work.tag);
                this.addWork(work);
            } else {
                work.pending = false;
                this.log("debug", LOG_ID + "getWork() - Continue Work[" + work.id + "] (state) '" + work.state + "'");
            }
        }
        return work;
    }
}

module.exports = Works;
