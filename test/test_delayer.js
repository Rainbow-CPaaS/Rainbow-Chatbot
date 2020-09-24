let chai = require('chai');
let expect = chai.expect; // we are using the "expect" style of Chai
const Delayer = require('../modules/delayer');
let spies = require('chai-spies');
let chaiAsPromised = require("chai-as-promised");

chai.use(spies);
chai.use(chaiAsPromised);

describe('Delayer', function() {

    it('should construct a delayer', function() {

        let delayer = new Delayer();
        expect(delayer).is.a("object");
        expect(delayer.listOfDelayed).is.a("object");
    });
});

describe('Delayer starting', function() {
    it('should start the Delayer', function() {
        let delayer = new Delayer();
        expect(delayer.start()).to.be.fulfilled;
    });
});

describe('Delayer should delay a work', function() {

    it('should store a work during 2000ms', function() {
        let delayer = new Delayer();
        let logger = {log: chai.spy('log')};
        let event = {emit: chai.spy('emit')};
        expect(delayer.start(event, logger)).to.be.fulfilled;
        let work = {"waiting": 500, "id": "12345"};
        delayer.delay(work);
        expect(delayer.listOfDelayed[work.id]).is.a('object');
        setTimeout(function() {
            expect(work.waiting).is.equal(0);
            expect(Object.keys(delayer.listOfDelayed).length).is.equals(0);
        }, 500);
    });

    it('should delay a work', function() {
        let delayer = new Delayer();
        let logger = {log: chai.spy('log')};
        let event = {emit: chai.spy('emit')};
        expect(delayer.start(event, logger)).to.be.fulfilled;
        let work = {"waiting": 2000, "id": "12345"};
        delayer.delayed(work);
        expect(work.waiting).is.equal(0);
        expect(event.emit).has.been.called.once;
    });
});
