"use strict";

const LOG_ID = "EXTPLG - ";

class ExternalPlug {

    constructor() {
    }

    getNextStep(work, step) {
        return step.next || null;
    }

    execute(work, step, event, logger) {

        logger.log("info", LOG_ID + "execute() - Work[" + work.id + "] - external");
        work.pending = false;
        work.waiting = step.waiting ? step.waiting : 0;
        work.external = true;
        logger.log("info", LOG_ID + "execute() - Work[" + work.id + "] - finished external");
    }

    isValid(work, step, content, event, logger) {
        logger.log("info", LOG_ID + "isValid() - Work[" + work.id + "] - external is valid");
        return true;
    }
}

module.exports = new ExternalPlug();