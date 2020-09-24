"use strict";

const LOG_ID = "Factory - ";

const MessagePlug = require('./messagePlug');
const ChoicePlug = require('./choicePlug');
const CommandPlug = require('./commandPlug');
const QuestionPlug = require('./questionPlug');
const ExternalPlug = require('./externalPlug');

class Factory {

    constructor() {
        this._event = null;
        this._logger = null;
        this._action = {
            "choice": ChoicePlug,
            "command": CommandPlug,
            "message": MessagePlug,
            "question": QuestionPlug,
            "external": ExternalPlug
        };
    }

    start(event, logger) {
        this._event = event;
        this._logger = logger;

        return new Promise(function(resolve) {
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

    isValid(work, step, content) {
        //todo
        if(step.type in this._action) {
            return this._action[step.type].isValid(work, step, content, this._event, this._logger);
        }
        
        this.log("info", LOG_ID + "isValid() - no plug found for work[" + work.id + "] and step " + step.type);
        return false;
    }

    setPlugins(listOfPlugins) {
        this._action = listOfPlugins;
    }

    findNextStep(work, stepId) {
        let step = null,
            next = null;

        this.log("info", LOG_ID + "findNextStep() - Enter");

        if(!stepId) {
            this.log("info", LOG_ID + "findNextStep() - Work[" + work.id + "] has no step defined" );
            return null;
        }

        step = work.scenario[stepId];

        if(!step) {
            this.log("info", LOG_ID + "findNextStep() - Work[" + work.id + "] has no next step defined" );
            return null;
        }

        if(!(step.type in this._action)) {
            return null;
        }
        
        next = this._action[step.type].getNextStep(work, step, this._logger);

        this.log("info", LOG_ID + "findNextStep() - Work[" + work._id + "] has a next step defined " + next );
        return next;
    }

    execute(work, step) {
        if(step.type in this._action) {
            try {
                this._action[step.type].execute(work, step, this._event, this._logger);
            } catch( err ) {
                this.log("error", LOG_ID + "execute() - work " + work.id + ", at step " + step.type + "experienced an error: ", err);
            }
        }
        else {
            work.pending = false;
            this.log("info", LOG_ID + "execute() - no plug found for work[" + work.id + "] and step " + step.type);
        }
    }
}

module.exports = Factory;