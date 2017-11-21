let chai = require('chai');
let expect = chai.expect; // we are using the "expect" style of Chai
let CommandPlug = require('../modules/plugins/commandPlug');
let spies = require('chai-spies');

chai.use(spies);

describe('CommandPlug constructor', function() {
    it('should create a CommandPlug', function() {
        expect(CommandPlug).is.a("object");
    });
});

describe('CommandPlug execution', function() {

    it('should execute a non waiting command', function() {
        let work = {"pending": false, "id": "12345", "from": "jid@company.com", "waiting": 0};
        let step = {"value": "a message", waiting: 0}
        
        let event = {"emit": chai.spy('emit')};
        let logger = {"log": chai.spy('log')};

        CommandPlug.execute(work, step, event, logger);

        expect(event.emit).has.been.called.once;
        expect(work.pending).is.false;
        expect(work.waiting).to.equals(0);
    });

    it('should execute a non waiting but pending command', function() {
        let work = {"pending": false, "id": "12345", "from": "jid@company.com", "waiting": 0};
        let step = {"value": "a message", waiting: 0, pending: true}
        
        let event = {"emit": chai.spy('emit')};
        let logger = {"log": chai.spy('log')};

        CommandPlug.execute(work, step, event, logger);

        expect(event.emit).has.been.called.once;
        expect(work.pending).is.true;
        expect(work.waiting).to.equals(0);
    });

    it('should execute a waiting command', function() {
        let work = {"pending": false, "id": "12345", "from": "jid@company.com", "waiting": 0};
        let step = {"value": "a message", waiting: 1000}
        
        let event = {"emit": chai.spy('emit')};
        let logger = {"log": chai.spy('log')};

        CommandPlug.execute(work, step, event, logger);

        expect(event.emit).has.been.called.once;
        expect(work.pending).is.false;
        expect(work.waiting).to.equals(1000);
    });

});

describe('Command check validity', function() {
    
    it('should always return true when checking the validity', function() {
        let work = {"pending": false, "id": "12345", "from": "jid@company.com", "waiting": 0};
        let logger = {"log": chai.spy('log')};
        expect(CommandPlug.isValid(work, null, null, null, logger)).is.true;
    });
});

describe('CommandPlug Next', function() {
    
    it('should return the next step', function() {
        let step = {"next": "a next step"};
        expect(CommandPlug.getNextStep(null, step)).is.equals("a next step");
    });

    it('should return the null if there is no next step defined', function() {
        let step = {};
        expect(CommandPlug.getNextStep(null, step)).is.a("null");
    });
});