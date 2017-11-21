let chai = require('chai');
let expect = chai.expect; // we are using the "expect" style of Chai
let Factory = require('../modules/plugins/factory');
let Work = require('../modules/work');
let spies = require('chai-spies');

chai.use(spies);

describe('Factory constructor', function() {
    it('should create a Factory', function() {
        let factory = new Factory();
        expect(factory).is.a("object");
    });
});

describe('Factory starting', function() {
    it('should start the Factory', function() {
        let factory = new Factory();
        expect(factory.start()).to.be.fulfilled;
    });
});

describe('Factory execution', function() {

    it('should not execute a work if action is not managed', function() {
        let factory = new Factory();
        let step = {type:"aStep"};
        let work = {id: "12345"};
        factory.setPlugins({});
        factory.execute(work, step);
        expect(work.pending).to.be.false;
    });

    it('should execute a plug if action is managed', function() {
        let factory = new Factory();
        let step = {"type":"plug"};
        let work = {id: "12345"};
        let plugins = {"plug": {"execute": chai.spy('execute')}};
        factory.setPlugins(plugins);
        factory.execute(work, step);
        expect(plugins.plug.execute).to.be.called.once;
    });
});

describe('Factory should check the validity', function() {
    
        it('should return false if the action is not managed', function() {
            let factory = new Factory();
            let step = {type:"aStep"};
            let work = {id: "12345"};
            factory.setPlugins({});
            expect(factory.isValid(work, step, "toto")).is.false;
        });
    
        it('should call the plugin if action is managed', function() {
            let factory = new Factory();
            let step = {"type":"plug"};
            let work = {id: "12345"};
            let plugins = {"plug": {"isValid": chai.spy('execute')}};
            factory.setPlugins(plugins);
            factory.isValid(work, step);
            expect(plugins.plug.isValid).to.be.called.once;
        });
    });

describe('check that a log is written', function() {
    
    it('should not use the console.log when no logger defined', function() {
        let factory = new Factory();
        let spy = chai.spy.on(console, 'log');
        factory.log("level", "message", null);
        expect(spy).to.be.called;
        spy = null;
    });

    it('should use the logger when defined', function() {
        let logger = {log: chai.spy('log')};
        let factory = new Factory(null, logger, null);
        expect(factory.start(null, logger)).to.be.fulfilled;
        factory.log("level", "message", null);
        expect(logger.log).to.be.called;
    });
});

describe('Find next step', function() {
    
    it("should find the next step when a message step", function() {
        let logger = {log: chai.spy('log')};
        let factory = new Factory();
        let work = new Work(null, null, factory);
        expect(factory.start(null, logger)).to.be.fulfilled;
        work.scenario = {"stepOne":{"next": "stepTwo", "type": "message"}};
        expect(factory.findNextStep(work, "stepOne")).is.equal("stepTwo");
    });

    it("should find the next step when a choice step", function() {
        let logger = {log: chai.spy('log')};
        let factory = new Factory();
        let work = new Work(null, null, factory);
        expect(factory.start(null, logger)).to.be.fulfilled;
        work.scenario = {"stepOne":{"next": "stepTwo", "type": "choice"}};
        expect(factory.findNextStep(work, "stepOne")).is.equal("stepTwo");
    });

    it("should find the next step when a question step", function() {
        let logger = {log: chai.spy('log')};
        let factory = new Factory();
        let work = new Work(null, null, factory);
        expect(factory.start(null, logger)).to.be.fulfilled;
        work.scenario = {"stepOne":{"next": "stepTwo", "type": "question"}};
        expect(factory.findNextStep(work, "stepOne")).is.equal("stepTwo");
    });

    it("should find the next step when a command step", function() {
        let logger = {log: chai.spy('log')};
        let factory = new Factory();
        let work = new Work(null, null, factory);
        expect(factory.start(null, logger)).to.be.fulfilled;
        work.scenario = {"stepOne":{"next": "stepTwo", "type": "command"}};
        expect(factory.findNextStep(work, "stepOne")).is.equal("stepTwo");
    });

    it("should find the next step when a external step", function() {
        let logger = {log: chai.spy('log')};
        let factory = new Factory();
        let work = new Work(null, null, factory);
        expect(factory.start(null, logger)).to.be.fulfilled;
        work.scenario = {"stepOne":{"next": "stepTwo", "type": "external"}};
        expect(factory.findNextStep(work, "stepOne")).is.equal("stepTwo");
    });

    it("should find the next step (null) when an unknown step", function() {
        let logger = {log: chai.spy('log')};
        let factory = new Factory();
        let work = new Work(null, null, factory);
        expect(factory.start(null, logger)).to.be.fulfilled;
        work.scenario = {"stepOne":{"next": "stepTwo", "type": "unknown"}};
        expect(factory.findNextStep(work, "stepOne")).is.a("null");
    });

    it("should return null when the current step is not in the scenario", function() {
        let logger = {log: chai.spy('log')};
        let factory = new Factory();
        let work = new Work(null, null, factory);
        expect(factory.start(null, logger)).to.be.fulfilled;
        work.scenario = {"stepOne":{"next": "stepTwo", "type": "unknown"}};
        expect(factory.findNextStep(work, "stepThree")).is.a("null");
    });

    it("should return null when the current step is null", function() {
        let logger = {log: chai.spy('log')};
        let factory = new Factory();
        let work = new Work(null, null, factory);
        expect(factory.start(null, logger)).to.be.fulfilled;
        work.scenario = {"stepOne":{"next": "stepTwo", "type": "unknown"}};
        expect(factory.findNextStep(work)).is.a("null");
    });

    it("should return null when there is no next step", function() {
        let logger = {log: chai.spy('log')};
        let factory = new Factory();
        let work = new Work(null, null, factory);
        expect(factory.start(null, logger)).to.be.fulfilled;
        work.scenario = {"stepOne":{}};
        expect(factory.findNextStep(work)).is.a("null");
    });
});

