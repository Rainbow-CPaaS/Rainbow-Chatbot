let chai = require('chai');
let expect = chai.expect; // we are using the "expect" style of Chai
let Work = require('../modules/work');
let Factory = require('../modules/plugins/factory');
let spies = require('chai-spies');

let chaiAsPromised = require("chai-as-promised");

chai.use(spies);
chai.use(chaiAsPromised);

describe('Work constructor', function() {
    it('should create a new work', function() {
        let work = new Work();
        expect(work).is.a("object");
    });

    it('should have a default id when created', function() {
        let work = new Work();
        expect(work.id).is.a("string");
        expect(work.id.length).is.not.equal(0);
    });

    it('should have a state equal to NEW when created', function() {
        let work = new Work();
        expect(work.state).is.equal(Work.STATE.NEW);
    });

    it('should not be queued when created', function() {
        let work = new Work();
        expect(work.queued).is.equal(Work.QUEUE.NOTQUEUED);
    });

    it('should not be an external when created', function() {
        let work = new Work();
        expect(work.external).is.false;
    });

    it('should have an empty history', function() {
        let work = new Work();
        expect(work.history).is.eqls([]);
    });

    it('should not be queued when created', function() {
        let work = new Work();
        expect(work.pending).is.equal(Work.ANSWER.NOTPENDING);
    });

    it('should have a created date when created', function() {
        let work = new Work();
        expect(work.createdOn).is.a('date');
    });

    it('should have not have an ended date when created', function() {
        let work = new Work();
        expect(work.endedOn).is.a('null');
    });

    it('should not be waiting when created', function() {
        let work = new Work();
        expect(work.waiting).is.equal(0);
    });

    it('should not have a current step id when created', function() {
        let work = new Work();
        expect(work.step).is.a('null');
    });

    it('should not have a next step id when created', function() {
        let work = new Work();
        expect(work.forcedNextStep).is.a('null');
    });
    
    it('should not have a from user when created', function() {
        let work = new Work();
        expect(work.from).is.a('null');
    });

    it('should not have a fromjid when created', function() {
        let work = new Work();
        expect(work.jid).is.a('null');
    });

    it('should not have a scenario name when created', function() {
        let work = new Work();
        expect(work.tag).is.a('string').and.is.equal("");
    });

    it('should not have a scenario when created', function() {
        let work = new Work();
        expect(work.scenario).is.a('null');
    });
});

describe('Work setter and getter', function() {
    it('should close the work', function() {
        let work = new Work();
        work.close();
        expect(work.isFinished).is.equal(true);
        expect(work.isClosed).is.equal(true);
    });

    it('should terminate the work', function() {
        let work = new Work();
        work.terminate();
        expect(work.isFinished).is.equal(true);
        expect(work.isTerminated).is.equal(true);
    });

    it('should abort the work', function() {
        let work = new Work();
        work.pending = true;
        work.waiting = 1000;
        work.abort();
        expect(work.isAborted).is.equal(true);
        expect(work.pending).is.equal(false);
        expect(work.waiting).is.equal(0);
    });

    it('should block the work', function() {
        let work = new Work();
        work.block();
        expect(work.isBlocked).is.equal(true);
    });

    it('should set the right step', function() {
        let work = new Work();
        work.step = "12345";
        expect(work.step).is.equal("12345");
    });

    it('should set the next step', function() {
        let work = new Work();
        work.nextStep = "12345";
        expect(work.nextStep).is.equal("12345");
    });

    it('should set the external', function() {
        let work = new Work();
        work.external = true;
        expect(work.external).is.true;
    });

    it('should set the tag', function() {
        let work = new Work();
        work.tag = "myTag";
        expect(work.tag).is.equal("myTag");
    });

    it('should set the waiting', function() {
        let work = new Work();
        work.waiting = 2000;
        expect(work.waiting).is.equal(2000);
    });

    it('should set the jid', function() {
        let work = new Work();
        work.jid = "12345@ale.com";
        expect(work.jid).is.equal("12345@ale.com");
    });

    it('should set the user', function() {
        let work = new Work();
        work.from = {'id': 12345};
        expect(work.from).is.eql({'id': 12345});
    });

    it('should set the work as "pending"', function() {
        let work = new Work();
        work.pending = Work.ANSWER.PENDING;
        expect(work.pending).is.equal(Work.ANSWER.PENDING);
    });

    it('should set the work as "queued"', function() {
        let work = new Work();
        work.queued = Work.QUEUE.QUEUED;
        expect(work.queued).is.equal(Work.QUEUE.QUEUED);
    });

    it('should set the scenario', function() {
        let work = new Work();
        work.scenario = {"step1": {}};
        expect(work.scenario).is.eql({"step1": {}});
    });
});

describe('Move scenario', function() {
    it('should go to the first step when there is no step defined', function() {
        let factory = new Factory();
        let work = new Work(null, null, factory);
        
        work.scenario = {"stepOne":{"type": "message"}};
        work.move();
        expect(work.step).is.equal("stepOne");
    });

    it('should go to the first step and prepare the next step when exists', function() {
        let factory = new Factory();
        let work = new Work(null, null, factory);
        work.scenario = {"stepOne":{"next": "stepTwo", "type": "message"}};
        work.move();
        expect(work.step).is.equal("stepOne");
    });

    it('should block the work if there is no step defined', function() {
        let factory = new Factory();
        let work = new Work(null, null, factory);
        work.scenario = {};
        work.move();
        expect(work.step).is.a('null');
        expect(work.state).is.equal(Work.STATE.BLOCKED);
    });

    it('should move to the next step that is a terminal step defined', function() {
        let factory = new Factory();
        let work = new Work(null, null, factory);
        work.scenario = {"stepOne":{"next": "stepTwo", "type": "message"}, "stepTwo": {"next": null}};
        work.step = "stepOne";
        work.move();
        expect(work.step).is.equal("stepTwo");
    });

    it('should move to the next step that is a terminal step not defined', function() {
        let factory = new Factory();
        let work = new Work(null, null, factory);
        work.scenario = {"stepOne":{"next": "stepTwo", "type": "message"}, "stepTwo": {}};
        work.step = "stepOne";
        work.move();
        expect(work.step).is.equal("stepTwo");
    });
    
    it('should move to the next step that is not a terminal step', function() {
        let factory = new Factory();
        let work = new Work(null, null, factory);
        work.scenario = {"stepFour":{"next": "stepFive", "type": "message"}, "stepFive": {"next": "stepSix", "type": "message"}};
        work.step = "stepFour";
        work.move();
        expect(work.step).is.equal("stepFive");
    });
});

describe('Next state', function() {
    
    it("should move from state NEW to state INPROGRESS", function() {
        let work = new Work();
        work.next();
        expect(work.state).is.equal(Work.STATE.INPROGRESS);
    });

    it("should move from state INPROGRESS to state TERMINATED", function() {
        let work = new Work();
        work.state = Work.STATE.INPROGRESS;
        work.next();
        expect(work.state).is.equal(Work.STATE.TERMINATED);
    });

    it("should move from state TERMINATED to state CLOSED", function() {
        let work = new Work();
        work.state = Work.STATE.TERMINATED;
        work.next();
        expect(work.state).is.equal(Work.STATE.CLOSED);
    });

    it("should not move when in state CLOSED", function() {
        let work = new Work();
        work.state = Work.STATE.CLOSED;
        work.next();
        expect(work.state).is.equal(Work.STATE.CLOSED);
    });

    it("should not move when in state ABORTED", function() {
        let work = new Work();
        work.state = Work.STATE.ABORTED;
        work.next();
        expect(work.state).is.equal(Work.STATE.ABORTED);
    });

    it("should not move when in state UNKNOWN", function() {
        let work = new Work();
        work.state = Work.STATE.UNKNOWN;
        work.next();
        expect(work.state).is.equal(Work.STATE.UNKNOWN);
    });
});

describe('check if the scenario is finished', function() {
    
    it("return true for an uninitialized work", function() {
        let work = new Work();
        expect(work.hasNoMoreStep()).is.equal(true);
    });

    it("return true when there is no more step", function() {
        let factory = new Factory();
        let work = new Work(null, null, factory);
        work.step = "stepTwo";
        work.scenario = {"stepOne":{"next": "stepTwo", "type": "message"}, "stepTwo":{"type": "message"}};
        expect(work.hasNoMoreStep()).is.equal(true);
    });

    it("return false when there is a new step", function() {
        let factory = new Factory();
        let work = new Work(null, null, factory);
        work.step = "stepOne";
        work.scenario = {"stepOne":{"next": "stepTwo", "type": "message"}, "stepTwo":{}};
        expect(work.hasNoMoreStep()).is.equal(false);
    });

    it("return false when there is a pending step", function() {
        let work = new Work();
        work.step = "stepOne";
        work.pending = true;
        expect(work.hasNoMoreStep()).is.equal(false);
    });
});

describe ('check that execute function is well done', function() {

    it('should execute an undefined work', function() {
        let factory = {execute: chai.spy('execute')};
        let work = new Work(null, null, factory);
        work.executeStep();
        expect(factory.execute).to.not.be.called;
    });

    it('should execute a step of type message', function() {
        let factory = {execute: chai.spy('execute')};
        let work = new Work(null, null, factory);
        work.step = "stepOne";
        work.scenario = {"stepOne":{"next": "stepTwo", "type": "message"}};

        work.executeStep();
        expect(factory.execute).to.be.called.once;
    });

    it('should execute a step of type choice', function() {
        let factory = {execute: chai.spy('execute')};
        let work = new Work(null, null, factory);
        work.step = "stepOne";
        work.scenario = {"stepOne":{"next": "stepTwo", "type": "choice", "list": ["one", "two"]}};

        work.executeStep();
        expect(factory.execute).to.be.called.once;
    });

    it('should execute a step of type command that is not pending', function() {
        let factory = {execute: chai.spy('execute')};
        let work = new Work(null, null, factory);
        work.step = "stepOne";
        work.scenario = {"stepOne":{"next": "stepTwo", "type": "command", "pending": false}};

        work.executeStep();
        expect(factory.execute).to.be.called.once;
    });

    it('should execute a step of type command that is pending', function() {
        let factory = {execute: chai.spy('execute')};
        let work = new Work(null, null, factory);
        work.step = "stepOne";
        work.scenario = {"stepOne":{"next": "stepTwo", "type": "command", "pending": true}};

        work.executeStep();
        expect(factory.execute).to.be.called.once;
    });

    it('should execute a step of type external', function() {
        let factory = {execute: chai.spy('execute')};
        let work = new Work(null, null, factory);

        work.scenario = {"stepOne":{"next": "stepTwo", "type": "external"}};
        work.step = "stepOne";
        work.executeStep();
        expect(factory.execute).to.be.called.once;
    });

    it('should execute a step of type unknown', function() {
        let factory = {execute: chai.spy('execute')};
        let work = new Work(null, null, factory);

        work.scenario = {"stepOne":{"next": null, "type": "unknown"}};
        work.step = "stepOne"
        work.executeStep();
        expect(factory.execute).to.not.be.called;
    });
});

describe ('historize', function() {

    it('should historize a step', function() {
        let work = new Work();
        let msg = {"value": "an answer"};
        work.scenario = {"stepOne":{"next": null, "type": "message"}};
        work.step = "stepOne";

        work.historizeStep(work.step);
        expect(work.history).to.eqls([{"step": "stepOne", "content": ""}])
    });

    it('should historize a message', function() {
        let work = new Work();
        let msg = {"value": "an answer"};
        work.scenario = {"stepOne":{"next": null, "type": "message"}};
        work.step = "stepOne";

        work.historizeStep(work.step);
        work.historize(msg);
        expect(work.history).to.eqls([{"step": "stepOne", "content": "an answer"}]);
    });

});
