let chai = require('chai');
let expect = chai.expect; // we are using the "expect" style of Chai
const Logger = require('../modules/logger');
let spies = require('chai-spies');
let chaiAsPromised = require("chai-as-promised");

chai.use(spies);
chai.use(chaiAsPromised);

describe('Logger', function() {

    it('should create a logger', function() {
        let logger = new Logger();
        expect(logger).is.a('object');
    });

    it('should get the internal winston logger', function() {
        let logger = new Logger();
        expect(logger.log).is.a('object');
    });

});