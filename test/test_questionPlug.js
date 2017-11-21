let chai = require('chai');
let expect = chai.expect; // we are using the "expect" style of Chai
let QuestionPlug = require('../modules/plugins/questionPlug');
let spies = require('chai-spies');

chai.use(spies);

describe('QuestionPlug constructor', function() {
    it('should create a QuestionPlug', function() {
        expect(QuestionPlug).is.a("object");
    });
});

describe('QuestionPlug execution', function() {

    it('should execute a non waiting question', function() {
        let work = {"pending": false, "id": "12345", "from": "jid@company.com", "waiting": 0};
        let step = {"value": "a choice", "waiting": 0};
        
        let event = {"emit": chai.spy('emit')};
        let logger = {"log": chai.spy('log')};

        QuestionPlug.execute(work, step, event, logger);

        expect(event.emit).has.been.called.once;
        expect(work.pending).is.true;
        expect(work.waiting).to.equals(0);
    });

    it('should execute a waiting question', function() {
        let work = {"pending": false, "id": "12345", "from": "jid@company.com", "waiting": 0};
        let step = {"value": "a choice", "waiting": 1000};
        
        let event = {"emit": chai.spy('emit')};
        let logger = {"log": chai.spy('log')};

        QuestionPlug.execute(work, step, event, logger);

        expect(event.emit).has.been.called.once;
        expect(work.pending).is.true;
        expect(work.waiting).to.equals(1000);
    });

});

describe('QuestionPlug check validity', function() {
    
    it('should always return true when checking the validity', function() {
        let work = {"pending": false, "id": "12345", "from": "jid@company.com", "waiting": 0};
        let logger = {"log": chai.spy('log')};
        expect(QuestionPlug.isValid(work, null, null, null, logger)).is.true;
    });
});

describe('QuestionPlug Next', function() {
    
    it('should return the next step', function() {
        let step = {"next": "a next step"};
        expect(QuestionPlug.getNextStep(null, step)).is.equals("a next step");
    });

    it('should return the null if there is no next step defined', function() {
        let step = {};
        expect(QuestionPlug.getNextStep(null, step)).is.a("null");
    });
});