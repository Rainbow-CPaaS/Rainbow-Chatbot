let chai = require('chai');
let expect = chai.expect; // we are using the "expect" style of Chai
let ChoicePlug = require('../modules/plugins/choicePlug');
let Work = require('../modules/work');
let spies = require('chai-spies');

chai.use(spies);

describe('ChoicePlug constructor', function() {
    it('should create a ChoicePlug', function() {
        expect(ChoicePlug).is.a("object");
    });
});

describe('ChoicePlug execution', function() {

    it('should execute a non waiting choice', function() {
        let work = {"pending": false, "id": "12345", "from": "jid@company.com", "waiting": 0};
        let step = {"value": "a choice", "waiting": 0, "list": ["a", "b", "c"]};
        
        let event = {"emit": chai.spy('emit')};
        let logger = {"log": chai.spy('log')};

        ChoicePlug.execute(work, step, event, logger);

        expect(event.emit).has.been.called.twice;
        expect(work.pending).is.true;
        expect(work.waiting).to.equals(0);
    });

    it('should execute a waiting message', function() {
        let work = {"pending": false, "id": "12345", "from": "jid@company.com", "waiting": 0};
        let step = {"value": "a choice", "waiting": 1000, "list": ["a", "b", "c"]};
        
        let event = {"emit": chai.spy('emit')};
        let logger = {"log": chai.spy('log')};

        ChoicePlug.execute(work, step, event, logger);

        expect(event.emit).has.been.called.twice;
        expect(work.pending).is.true;
        expect(work.waiting).to.equals(1000);
    });
});

describe('ChoicePlug check validity', function() {

    it('should return true if the content is valid', function() {
        let work = {"pending": false, "id": "12345", "from": "jid@company.com", "waiting": 0};
        let step = {"value": "a choice", "waiting": 0, "list": ["a", "b", "c"]};
        
        let event = {"emit": chai.spy('emit')};
        let logger = {"log": chai.spy('log')};

        expect(ChoicePlug.isValid(work, step, "a", event, logger)).is.true;
        expect(ChoicePlug.isValid(work, step, "b", event, logger)).is.true;
        expect(ChoicePlug.isValid(work, step, "c", event, logger)).is.true;
    });

    it('should return false if the content is not valid', function() {
        let work = {"pending": false, "id": "12345", "from": "jid@company.com", "waiting": 0};
        let step = {"value": "a choice", "waiting": 0, "list": ["a", "b", "c"]};
        
        let event = {"emit": chai.spy('emit')};
        let logger = {"log": chai.spy('log')};

        expect(ChoicePlug.isValid(work, step, "d", event, logger)).is.false;
        expect(ChoicePlug.isValid(work, step, "", event, logger)).is.false;
        expect(ChoicePlug.isValid(work, step, null, event, logger)).is.false;
    });

    it('should return false if there is no list', function() {
        let work = {"pending": false, "id": "12345", "from": "jid@company.com", "waiting": 0};
        let step = {"value": "a choice", "waiting": 0};
        
        let event = {"emit": chai.spy('emit')};
        let logger = {"log": chai.spy('log')};

        expect(ChoicePlug.isValid(work, step, "d", event, logger)).is.false;
        expect(ChoicePlug.isValid(work, step, "", event, logger)).is.false;
        expect(ChoicePlug.isValid(work, step, null, event, logger)).is.false;
    });

    it('should send a message when there is an invalid property and not valid', function() {
        let work = {"pending": false, "id": "12345", "from": "jid@company.com", "waiting": 0};
        let step = {"value": "a choice", "waiting": 0, "invalid": "", "list": ["a", "b", "c"]};
        
        let event = {"emit": chai.spy('emit')};
        let logger = {"log": chai.spy('log')};

        expect(ChoicePlug.isValid(work, step, "d", event, logger)).is.false;
        expect(event.emit).has.been.called.once;
    });

});

describe('ChoicePlug Next', function() {
    
    it('should return the next step', function() {
        let step = {"next": "a next step"};
        let logger = {"log": chai.spy('log')};
        let work = {"id": "12345"};
        expect(ChoicePlug.getNextStep(work, step, logger)).is.equals("a next step");
    });

    it('should return the null if there is no next step defined', function() {
        let step = {};
        let work = {"id": "12345"};
        let logger = {"log": chai.spy('log')};
        expect(ChoicePlug.getNextStep(work, step, logger)).is.a("null");
    });

    it('should return the step "left"', function() {
        let step = {type: "choice", "list":["A", "B"], "next": ["left", "right"]};
        let work = {"id": "12345"};
        let logger = {"log": chai.spy('log')};
        work.step = "choice";
        work.history = [{"step": "choice", "content": "A"}];
        expect(ChoicePlug.getNextStep(work, step, logger)).is.equals("left");
    });

    it('should return the step "right"', function() {
        let step = {type: "choice", "list":["A", "B"], "next": ["left", "right"]};
        let work = {"id": "12345"};
        let logger = {"log": chai.spy('log')};
        work.step = "choice";
        work.history = [{"step": "choice", "content": "B"}];
        expect(ChoicePlug.getNextStep(work, step, logger)).is.equals("right");
    });

    it('should return the step "right when only one answer"', function() {
        let step = {type: "choice", "list":["A", "B"], "next": ["right"]};
        let work = {"id": "12345"};
        let logger = {"log": chai.spy('log')};
        work.step = "choice";
        work.history = [{"step": "choice", "content": "B"}];
        expect(ChoicePlug.getNextStep(work, step, logger)).is.equals("right");
    });

    it('should return the step "right when one answer but not the right one"', function() {
        let step = {type: "choice", "list":["A", "B"], "next": ["right"]};
        let work = {"id": "12345"};
        let logger = {"log": chai.spy('log')};
        work.step = "choice";
        work.history = [{"step": "choice", "content": "B"}];
        expect(ChoicePlug.getNextStep(work, step, logger)).is.equals("right");
    });

    it('should return null if the list is null"', function() {
        let step = {type: "choice", "list": null, "next": ["left", "right"]};
        let work = {"id": "12345"};
        let logger = {"log": chai.spy('log')};
        work.step = "choice";
        work.history = [{"step": "choice", "content": "B"}];
        expect(ChoicePlug.getNextStep(work, step, logger)).is.a("null");
    });

    it('should return null the history is null"', function() {
        let step = {type: "choice", "list": null, "next": ["left", "right"]};
        let work = {"id": "12345"};
        let logger = {"log": chai.spy('log')};
        work.step = "choice";

        expect(ChoicePlug.getNextStep(work, step, logger)).is.a("null");
    });

    it('should return null when the history does not contain the step"', function() {
        let step = {type: "choice", "list": null, "next": ["left", "right"]};
        let work = {"id": "12345"};
        let logger = {"log": chai.spy('log')};
        work.step = "choice";
        work.history = [{"step": "question", "content": "B"}];
        expect(ChoicePlug.getNextStep(work, step, logger)).is.a("null");
    });

    it('should return null when the index is not in the list"', function() {
        let step = {type: "choice", "list": ["a", "b", "c"], "next": ["left", "right"]};
        let work = {"id": "12345"};
        let logger = {"log": chai.spy('log')};
        work.step = "choice";
        work.history = [{"step": "question", "content": "c"}];
        expect(ChoicePlug.getNextStep(work, step, logger)).is.a("null");
    });
});

