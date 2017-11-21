"use strict";

const LOG_ID = "MSGPLG - ";

class MessagePlug {

    constructor() {
    }

    getNextStep(work, step) {
        return step.next || null;
    }

    execute(work, step, event, logger) {

        logger.log("info", LOG_ID + "execute() - Work[" + work.id + "] - message");
        event.emit("onSendMessage", {
            message: step.value ? step.value : "", 
            jid: work.jid,
            type: "message"
        });
        work.pending = false;
        work.waiting = step.waiting ? step.waiting : 0;
        logger.log("info", LOG_ID + "execute() - Work[" + work.id + "] - finished message");
    }

    isValid(work, step, content, event, logger) {
        logger.log("info", LOG_ID + "isValid() - Work[" + work.id + "] - message is valid");
        return true;
    }
}

module.exports = new MessagePlug();