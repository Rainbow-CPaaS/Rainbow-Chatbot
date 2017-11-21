let chai = require('chai');
let expect = chai.expect; // we are using the "expect" style of Chai
let Works = require('../modules/works');
let Work = require('../modules/work');
let spies = require('chai-spies');
let chaiAsPromised = require("chai-as-promised");

chai.use(spies);
chai.use(chaiAsPromised);

describe('Works constructor', function() {
    it('should create a new works', function() {
        let works = new Works();
        expect(works).is.a("object");
    });

    it('should have an empty list of work', function() {
        let works = new Works();
        expect(works.listOfWorks).is.eqls([]);
    });
});

describe('Starting the Works', function() {
    it('should start the works correctly', function() {
        let works = new Works();
        expect(works.start()).to.be.fulfilled;
    });
});

describe('Working with work', function() {
    it('should add a new work', function() {
        let works = new Works();
        let work = {};
        works.addWork(work);
        expect(works.listOfWorks.length).is.equal(1);
    });

    it('should return a work', function() {
        let works = new Works();
        let work = new Work();
        work.jid = "12345";
        works.addWork(work);
        expect(works.getWorkByJid("12345")).is.equal(work);
    });

    it('should not return a closed work', function() {
        let works = new Works();
        let work = new Work();
        work.jid = "12345";
        work.state = Work.STATE.CLOSED;
        works.addWork(work);
        expect(works.getWorkByJid("12345")).is.a("undefined");
    });

    it('should not return a terminated work', function() {
        let works = new Works();
        let work = new Work();
        work.jid = "12345";
        work.state = Work.STATE.TERMINATED;
        works.addWork(work);
        expect(works.getWorkByJid("12345")).is.a("undefined");
    });

    it('should not return an aborted work', function() {
        let works = new Works();
        let work = new Work();
        work.jid = "12345";
        work.state = Work.STATE.ABORTED;
        works.addWork(work);
        expect(works.getWorkByJid("12345")).is.a("undefined");
    });

    it('should not return a blocked work', function() {
        let works = new Works();
        let work = new Work();
        work.jid = "12345";
        work.state = Work.STATE.BLOCKED;
        works.addWork(work);
        expect(works.getWorkByJid("12345")).is.a("undefined");
    });
});