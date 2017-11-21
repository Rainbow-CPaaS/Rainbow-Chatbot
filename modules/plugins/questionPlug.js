"use strict";

const LOG_ID = "QUESTIONPLG - ";

class QuestionPlug {

    constructor() {
    }

    getNextStep(work, step) {
        return step.next || null;
    }

    execute(work, step, event, logger) {
        logger.log("info", LOG_ID + "execute() - Work[" + work.id + "] - question");
        event.emit("onSendMessage", {
            message: step.value ? step.value : "", 
            jid: work.jid,
            type: "question"
        });

        work.pending = true;
        work.waiting = step.waiting ? step.waiting : 0;
        logger.log("info", LOG_ID + "execute() - Work[" + work.id + "] - finished question");
    }

    isValid(work, step, content, event, logger) {
        logger.log("info", LOG_ID + "isValid() - Work[" + work.id + "] - question is valid");
        return true;
    }
}

module.exports = new QuestionPlug();