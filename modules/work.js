"use strict";

const cuid = require("cuid");

const LOG_ID = "WORK - ";

class Work {

    constructor(event, logger, factory) {
        this._event = event;
        this._logger = logger;
        this._factory = factory;
        this._state = Work.STATE.NEW;   // Current state of the work
        this._id = cuid();              // Work ID
        this._created = new Date();
        this._ended = null;
        this._queued = Work.QUEUE.NOTQUEUED;     // When queued, no input is taken into account from user
        this._pending = Work.ANSWER.NOTPENDING; // When something is expecting from the user
        this._stepId = null;              // Current step in the scenario
        this._forcedNextStepId = null;             // Next step in scenario
        this._from = null;              // Associated user
        this._fromJID = null;           // User JID
        this._tag = "";                 // Scenario name
        this._scenario = null;          // Scenario
        this._waiting = 0;             // When the work need to sleep
        this._external = false;         // Need to execute an external task
        this.log("info", LOG_ID + "constructor() - Work[" + this._id + "] (state) changed to '" + this._state + "'");
        this._history = [];           // History of inputs 
    }

    get id() {
        return this._id;
    }

    get jid() {
        return this._fromJID;
    }

    get state() {
        return this._state;
    }

    get from() {
        return this._from;
    }

    get pending() {
        return this._pending;
    }

    get waiting() {
        return this._waiting;
    }

    get createdOn() {
        return this._created;
    }

    get endedOn() {
        return this._ended;
    }

    get external() {
        return this._external;
    }

    get queued() {
        return this._queued;
    }

    get isFinished() {
        return this._state === Work.STATE.CLOSED || this._state === Work.STATE.TERMINATED;
    }

    get isClosed() {
        return this._state === Work.STATE.CLOSED;
    }

    get isAborted() {
        return this._state === Work.STATE.ABORTED;
    }

    get isBlocked() {
        return this._state === Work.STATE.BLOCKED;
    }

    get isTerminated() {
        return this._state === Work.STATE.TERMINATED;
    }

    get step() {
        return this._stepId;
    }

    get forcedNextStep() {
        return this._forcedNextStepId;
    }

    get tag() {
        return this._tag;
    }

    get scenario() {
        return this._scenario;
    }

    get history() {
        return this._history;
    }

    set step(stepId) {
        this._stepId = stepId;
        this.log("info", LOG_ID + "step() - Work[" + this._id + "] (step) changed to '" + this._stepId + "'");
    }

    set history(history) {
        this._history = history;
    }

    set forcedNextStep(stepId) {
        this._forcedNextStepId = stepId;
        this.log("info", LOG_ID + "step() - Work[" + this._id + "] (nextStep) forced to '" + this._forcedNextStepId + "'");
    }

    set scenario(scenario) {
        this._scenario = scenario;
    }

    set queued(isQueued) {
        this._queued = isQueued;
    }

    set endedOn(date) {
        this._ended = date;
    }

    set external(external) {
        this._external = external;
    }

    set state(state) {
        this._state = state;
        this.log("info", LOG_ID + "jid() - Work[" + this._id + "] (state) changed to '" + this._state + "'");
    }

    set tag(tag) {
        this._tag = tag;
    }

    set jid(jid) {
        this._fromJID = jid;
        this.log("info", LOG_ID + "jid() - Work[" + this._id + "] (jid) changed to '" + jid + "'");
    }

    set from(user) {
        this._from = user;
        this.log("info", LOG_ID + "from() - Work[" + this._id + "] (from) changed to '" + JSON.stringify(user) + "'");
    }

    set pending(isPending) {
        this._pending = isPending;
    }

    set waiting(time) {
        this._waiting = time;
    }

    historizeStep(step) {
        this.log("info", LOG_ID + "historizeStep() - Work[" + this._id + "] (history) added step '" + step + "'");
        this._history.push({"step": this._stepId, "content": ""});
    }

    historize(msg) {
        let that = this;
        
        this.log("info", LOG_ID + "historize() - Work[" + this._id + "] (history) added content '" + msg.value + "' for step '" + this._stepId + "'");

        let historyItem = this._history.find((item) => {
            return item.step === that._stepId;
        });

        if(historyItem) {
            historyItem.content = msg.value;
        }
    }

    executeStep() {

        this.historizeStep(this._stepId);

        if(this._stepId && this._scenario) {
            this.log("info", LOG_ID + "executeStep() - Work[" + this._id + "] is executing step " + this._stepId);
            
            let step = this._scenario[this._stepId];
            
            if(step) {
                this._factory.execute(this, step);
            }
        }
        else {
            this.log("warn", LOG_ID + "executeStep() - Work[" + this._id + "] has not stepId or scenario");
        }
    }

    move() {
        let old_step = this._stepId;
        this._stepId = this.getNextStep();
        if(!this._stepId) {
            this.block();
        }
        this.log("info", LOG_ID + "move() - Work[" + this._id + "] (step) changed from '" + old_step + "' to '" + this._stepId + "'");
    }

    getFirstStep() {
        if(!this._scenario || Object.keys(this._scenario).length === 0) {
            this.log("warn", LOG_ID + "movetoFirstStep() - Work[" + this._id + "] don't have any step defined");
            return null;
        }
        return(Object.keys(this._scenario)[0]);
    }

    getNextStep() {

        let nextStep = null;

        this.log("info", LOG_ID + "getNextStep() - Enter");

        if(this._stepId) {
            if(this._forcedNextStepId) {
                nextStep = this._forcedNextStepId;
                this._forcedNextStepId = null;
            }
            else {
                nextStep = this._factory.findNextStep(this, this._stepId);
            }
        }
        else {
            nextStep = this.getFirstStep();
        }

        this.log("info", LOG_ID + "getNextStep() - Work[" + this._id + "] found next step " + nextStep);

        return nextStep;
    }

    log(level, message, content) {
        if(this._logger) {
            this._logger.log(level, message);
        } else {
            if(content) {
                console.log(message, content);
            }
            else {
                console.log(message);
            }
        }
    }

    hasNoMoreStep() {
        
        if(this.pending) {
            this.log("info", LOG_ID + "hasNoMoreStep() - Work[" + this._id + "] need inputs for the current step " + this._stepId);
            
            return false;
        }

        let nextStep = this.getNextStep();

        if(nextStep && (nextStep in this._scenario)) {
            this.log("info", LOG_ID + "hasNoMoreStep() - Work[" + this._id + "] has a next step " + nextStep + " defined");
            return false;
        }

        this.log("info", LOG_ID + "hasNoMoreStep() - Work[" + this._id + "] has no more step in its scenario");
        return true;
    }

    close() {
        this._state = Work.STATE.CLOSED;
        this.log("warn", LOG_ID + "close() - Work[" + this._id + "] (state) changed to '" + this._state + "'");
    }

    abort() {
        this._state = Work.STATE.ABORTED;
        this.log("warn", LOG_ID + "abort() - Work[" + this._id + "] (state) changed to '" + this._state + "'");
    }

    terminate() {
        this._state = Work.STATE.TERMINATED;
        this.log("warn", LOG_ID + "terminate() - Work[" + this._id + "] (state) changed to '" + this._state + "'");
    }

    block() {
        this._state = Work.STATE.BLOCKED;
        this.log("warn", LOG_ID + "block() - Work[" + this._id + "] (state) changed to '" + this._state + "'");
    }

    next() {
        let hasChanged = false;

        switch (this._state) {
            case Work.STATE.NEW:
                this._state = Work.STATE.INPROGRESS;
                hasChanged = true;
                break;
            case Work.STATE.INPROGRESS:
                this._state = Work.STATE.TERMINATED;
                hasChanged = true;
                break;
            case Work.STATE.TERMINATED:
                this._state = Work.STATE.CLOSED;
                hasChanged = true;
                break;
            case Work.STATE.CLOSED:
            case Work.STATE.ABORTED:
                this.log("warn", LOG_ID + "next() - work is already in a terminal state (" + this._state + ")");    
                break;
            default:
                this.log("warn", LOG_ID + "next() - unknown state " + this._state);    
                break;
        }
        if(hasChanged) {
            this.log("info", LOG_ID + "next() - Work[" + this._id + "] (state) changed to '" + this._state + "'");
        }
    }
} 

module.exports = Work;

Work.STATE = {
    "NEW": "NEW",               // When the work is created
    "INPROGRESS": "INPROGRESS", // When the scenario of the work is ongoing
    "TERMINATED": "TERMINATED", // When the scenario of the work is finished
    "CLOSED": "CLOSED",         // When the work is closed
    "ABORTED": "ABORTED",       // When the work is aborted (user is starting a new one)
    "BLOCKED": "BLOCKED"        // When the work is blocked due to an issue (no step)
};

Work.QUEUE = {
    "QUEUED": true,
    "NOTQUEUED": false
};

Work.ANSWER = {
    "PENDING": true,
    "NOTPENDING": false
};