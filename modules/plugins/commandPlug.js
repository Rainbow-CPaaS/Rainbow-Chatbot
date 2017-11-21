"use strict";

const LOG_ID = "COMMANDPLG - ";

class CommandPlug {

    constructor() {
    }

    getNextStep(work, step) {
        return step.next || null;
    }

    execute(work, step, event, logger) {
        logger.log("info", LOG_ID + "execute() - Work[" + work.id + "] - command");
        event.emit("onSendMessage", {
            message: step.value ? step.value : "",
            jid: work.jid,
            type: "command"
        });
        work.pending = step.pending || false;
        work.waiting = step.waiting ? step.waiting : 0;
        logger.log("info", LOG_ID + "execute() - Work[" + work.id + "] - finished command");
    }

    isValid(work, step, content, event, logger) {
        logger.log("info", LOG_ID + "isValid() - Work[" + work.id + "] - command is valid");
        return true;
    }
}

module.exports = new CommandPlug();