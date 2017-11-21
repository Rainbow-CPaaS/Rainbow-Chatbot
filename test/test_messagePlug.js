let chai = require('chai');
let expect = chai.expect; // we are using the "expect" style of Chai
let MessagePlug = require('../modules/plugins/messagePlug');
let spies = require('chai-spies');

chai.use(spies);

describe('MessagePlug constructor', function() {
    it('should create a MessagePlug', function() {
        expect(MessagePlug).is.a("object");
    });
});

describe('MessagePlug execution', function() {

    it('should execute a non waiting message', function() {
        let work = {"pending": false, "id": "12345", "from": "jid@company.com", "waiting": 0};
        let step = {"value": "a message", waiting: 0}
        
        let event = {"emit": chai.spy('emit')};
        let logger = {"log": chai.spy('log')};

        MessagePlug.execute(work, step, event, logger);

        expect(event.emit).has.been.called.once;
        expect(work.pending).is.false;
        expect(work.waiting).to.equals(0);
    });

    it('should execute a waiting message', function() {
        let work = {"pending": false, "id": "12345", "from": "jid@company.com", "waiting": 0};
        let step = {"value": "a message", waiting: 1000}
        
        let event = {"emit": chai.spy('emit')};
        let logger = {"log": chai.spy('log')};

        MessagePlug.execute(work, step, event, logger);

        expect(event.emit).has.been.called.once;
        expect(work.pending).is.false;
        expect(work.waiting).to.equals(1000);
    });
});

describe('MessagePlug check validity', function() {

    it('should always return true when checking the validity', function() {
        let work = {"pending": false, "id": "12345", "from": "jid@company.com", "waiting": 0};
        let logger = {"log": chai.spy('log')};
        expect(MessagePlug.isValid(work, null, null, null, logger)).is.true;
    });
});

describe('MessagePlug Next', function() {
    
    it('should return the next step', function() {
        let step = {"next": "a next step"};
        expect(MessagePlug.getNextStep(null, step)).is.equals("a next step");
    });

    it('should return the null if there is no next step defined', function() {
        let step = {};
        expect(MessagePlug.getNextStep(null, step)).is.a("null");
    });
});