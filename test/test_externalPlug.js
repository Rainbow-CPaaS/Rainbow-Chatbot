let chai = require('chai');
let expect = chai.expect; // we are using the "expect" style of Chai
let ExternalPlug = require('../modules/plugins/externalPlug');
let spies = require('chai-spies');

chai.use(spies);

describe('ExternalPlug constructor', function() {
    it('should create a ExternalPlug', function() {
        expect(ExternalPlug).is.a("object");
    });
});

describe('ExternalPlug execution', function() {

    it('should execute a non waiting external', function() {
        let work = {"pending": false, "id": "12345", "from": "jid@company.com", "waiting": 0};
        let step = {"value": "a message", waiting: 0}
        
        let event = {"emit": chai.spy('emit')};
        let logger = {"log": chai.spy('log')};

        ExternalPlug.execute(work, step, event, logger);

        expect(event.emit).has.not.been.called;
        expect(work.pending).is.false;
        expect(work.external).is.true;
        expect(work.waiting).to.equals(0);
    });

    it('should execute a waiting external', function() {
        let work = {"pending": false, "id": "12345", "from": "jid@company.com", "waiting": 0};
        let step = {"value": "a message", waiting: 1000}
        
        let event = {"emit": chai.spy('emit')};
        let logger = {"log": chai.spy('log')};

        ExternalPlug.execute(work, step, event, logger);

        expect(event.emit).has.not.been.called;
        expect(work.pending).is.false;
        expect(work.external).is.true;
        expect(work.waiting).to.equals(1000);
    });

});

describe('External check validity', function() {
    
    it('should always return true when checking the validity', function() {
        let work = {"pending": false, "id": "12345", "from": "jid@company.com", "waiting": 0};
        let logger = {"log": chai.spy('log')};
        expect(ExternalPlug.isValid(work, null, null, null, logger)).is.true;
    });
});

describe('ExternalPlug Next', function() {
    
    it('should return the next step', function() {
        let step = {"next": "a next step"};
        expect(ExternalPlug.getNextStep(null, step)).is.equals("a next step");
    });

    it('should return the null if there is no next step defined', function() {
        let step = {};
        expect(ExternalPlug.getNextStep(null, step)).is.a("null");
    });
});