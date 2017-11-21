"use strict";

const LOG_ID = "CHOICEPLG - ";

class ChoicePlug {

    constructor() {
    }

    getNextStep(work, step, logger) {
        // Get the historized message

        let next = null;
        
        if(Array.isArray(step.next) && step.next.length > 1) {

            logger.log("info", LOG_ID + "getNextStep() - Work[" + work.id + "] - has a complexe next step");

            if(work.history) {
                let historyItem = work.history.find((item) => {
                    return item.step === work.step;
                });

                if(historyItem) {

                    logger.log("info", LOG_ID + "getNextStep() - Work[" + work.id + "] - has an history item for step " + work.step);

                    let message = historyItem.content;

                    logger.log("info", LOG_ID + "getNextStep() - Work[" + work.id + "] - has an history value " + message);
    
                    if(step.list && Array.isArray(step.list)) {
                        let index = step.list.indexOf(message);
                        logger.log("info", LOG_ID + "getNextStep() - Work[" + work.id + "] - has a an index response of " + index);
                        next = step.next[index] || null;
                    }
                }
            }
        }
        else {

            logger.log("info", LOG_ID + "getNextStep() - Work[" + work.id + "] - has a simple next step");

            if(Array.isArray(step.next)) {
                if(step.next.length === 1) {
                    next = step.next[0];
                }
            } else {
                next = step.next || null;
            }          
        }

        logger.log("info", LOG_ID + "getNextStep() - Work[" + work.id + "] - found next step " + next);

        return next;
    }

    execute(work, step, event, logger) {
        logger.log("info", LOG_ID + "execute() - Work[" + work.id + "] - choice");
        event.emit("onSendMessage", {
            message: step.value ? step.value : "", 
            jid: work.jid,
            type: "choice"
        });

        let message = "";
        let list = "";

        step.list.forEach((choice) => {
            message += "- " + choice + "\r\n"; 
            list += list.length === 0 ? choice : ',' + choice;
        });

        event.emit("onSendMessage", {
            message: list,
            messageMarkdown: message, 
            jid: work.jid,
            type: "list"
        });

        work.pending = true;
        work.waiting = step.waiting ? step.waiting : 0;
        logger.log("info", LOG_ID + "execute() - Work[" + work.id + "] - finished choice");
    }

    isValid(work, step, content, event, logger) {
        logger.log("info", LOG_ID + "isValid() - Work[" + work.id + "] - check answer validity...");

        if(step.list) {
            if(step.list.includes(content)) {
                logger.log("info", LOG_ID + "isValid() - Work[" + work.id + "] - answer is valid");

                return true;
            }
            else {
                logger.log("warn", LOG_ID + "isValid() - Work[" + work.id + "] - answer is not valid", content);

                if("invalid" in step) {
                    event.emit("onSendMessage", {
                        message: step.invalid,
                        jid: work.jid,
                        type: "list"
                    });
                }

                return false;
            }
        }
        else {
            return false;
        }
    }
}

module.exports = new ChoicePlug();