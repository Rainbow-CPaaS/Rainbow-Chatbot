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
        this._options = null;
    }

    start(event, logger, options) {

        let that = this;

        return new Promise((resolve) => {
            that._logger = logger;
            that._logger.log("debug", LOG_ID + "start() - Enter");
            that._event = event;
            that._options = options;
            that.createQueue();
            that._logger.log("debug", LOG_ID + "start() - Exit");
            resolve();
        });
    }

    createQueue() {

        let that = this;

        this._logger.log("debug", LOG_ID + "createQueue() - Enter");

        this._queue = async.queue(function (work, callback) {
            that._logger.log("info", LOG_ID + "createQueue() - Executing next work");
            that.executeWork(work).then(() => {
                callback(null);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "createQueue() - Error", err);
                callback(err);
            });
        }, (this._options && this._options.queue && this._options.queue.concurrency) ? this._options.queue.concurrency : 1);

        this._queue.drain(() => {
            that._logger.log('debug', LOG_ID + "createQueue() - all works have been processed");
        });

        this._queue.error(function (err, work) {
            that._logger.log("error", LOG_ID + "createQueue() - work " + work.id + "experienced an error: ", err);
        });

        this._logger.log("debug", LOG_ID + "createQueue() - Exit");
    }

    rejectExpiredWork(work, timeout) {
        return (() => {
            return new Promise((resolve, reject) => {
                setTimeout(() => reject(`the Work ${work.id} took too much time, it was cancelled`), timeout * 1000);
            })
        })();
    }

    executeWork(work) {

        let that = this;

        that._logger.log("debug", LOG_ID + "executeWork() - Enter");

        let workPromise = new Promise((resolve) => {

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
                    if (work.hasNoMoreStep()) {
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

        if (that._options && this._options.queue && this._options.queue.maxTaskDuration) {
            let duration = Number.parseInt(this._options.queue.maxTaskDuration, 10)
            duration = duration < 60 ? duration : 60;
            return Promise.race([workPromise, that.rejectExpiredWork(work, duration)])
        } else {
            return workPromise;
        }
    }

    addToQueue(work) {
        this._logger.log("debug", LOG_ID + "addToQueue() - Enter");
        this._logger.log("info", LOG_ID + "addToQueue() - Push work for user " + work.jid + "in state " + work.state);
        work.queue = true;

        this._queue.push(work, (err) => {
            if (err) {
                this._logger.log("error", LOG_ID + "addToQueue() - Error processing " + work.jid);
                this._logger.log('error', LOG_ID + "addToQueue() - err:" + err);
                work.abort();
                return;
            }
            this._logger.log("info", LOG_ID + "addToQueue() - Finished work for " + work.jid);

            work.queued = false;

            this._event.emit("ontaskfinished", work);

        });

        this._logger.log("debug", LOG_ID + "addToQueue() - Exit");
    }
}

module.exports = Queue;