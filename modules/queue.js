"use strict";

const async = require("async");
const Work = require("./work");

const LOG_ID = "QUEUE - ";

class Queue {

    // This class is used to debounce messages that come to the bot to allow a better scaling
    constructor() {
        this._event = null;
        this._logger = null;
        this._queue = null;
        this._lm = null;
    }

    start(event, logger, lm) {

        let that = this;

        return new Promise((resolve) => {
            that._logger = logger;
            that._logger.log("debug", LOG_ID + "start() - Enter");
            that._event = event;
            that._lm = lm;
            that.createQueue();
            that._logger.log("debug", LOG_ID + "start() - Exit");
            resolve();
        });
    }

    createQueue() {

        let that = this;

        this._logger.log("debug", LOG_ID + "createQueue() - Enter");

        this._queue = async.queue(function(work, callback) {
            that._logger.log("info", LOG_ID + "createQueue() - Executing next work");
            that.executeWork(work).then(() => {
                callback(null);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "createQueue() - Error", err);
                callback(err);
            });
        }, 1);

        this._logger.log("debug", LOG_ID + "createQueue() - Exit");
    }

    executeWork(work) {

        let that = this;

        that._logger.log("debug", LOG_ID + "executeWork() - Enter");

        return new Promise((resolve) => {

            that._logger.log("info", LOG_ID + "executeWork() - Execute work " + work.id + " | " + work.state);

            switch (work.state) {

                case Work.STATE.NEW:
                    work.next();
                    that._logger.log("debug", LOG_ID + "executeWork() - Exit from state NEW");
                    resolve();
                    break;
                case Work.STATE.INPROGRESS:
                    work.move();
                    work.executeStep();
                    if(work.hasNoMoreStep()) {
                        work.next();
                    }
                    that._logger.log("debug", LOG_ID + "executeWork() - Exit");
                    resolve();
                    break;
                case Work.STATE.TERMINATED:
                    work.next();
                    that._logger.log("debug", LOG_ID + "executeWork() - Exit");
                    resolve();
                    break;
                case Work.STATE.CLOSED:
                    that._logger.log("debug", LOG_ID + "executeWork() - Case closed");
                    that._logger.log("debug", LOG_ID + "executeWork() - Exit");
                    resolve();
                    break;
                default:
                    that._logger.log("warn", LOG_ID + "executeWork() - Incorrect state", work.state);
                    resolve();
                    break;
            }
        });
    }

    addToQueue(work) {
        let that = this;
        this._logger.log("debug", LOG_ID + "addToQueue() - Enter");
        this._logger.log("info", LOG_ID + "addToQueue() - Push work for user " + work.jid + "in state " + work.state);

        work.queue = true;

        this._queue.push(work, function(err) {
            if (err) {
                that._logger.log("error", LOG_ID + "addToQueue() - Error processing " + work.jid);
                return;
            }
            that._logger.log("info", LOG_ID + "addToQueue() - Finished work for " + work.jid);

            work.queued = false;

            that._event.emit("ontaskfinished", work);
            
        });
        this._logger.log("debug", LOG_ID + "addToQueue() - Exit");
    }
} 

module.exports = Queue;