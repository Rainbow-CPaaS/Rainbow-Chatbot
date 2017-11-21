let chai = require('chai');
let expect = chai.expect; // we are using the "expect" style of Chai
const getHashTags = require('../modules/hashtag');
let spies = require('chai-spies');
let chaiAsPromised = require("chai-as-promised");

chai.use(spies);
chai.use(chaiAsPromised);

describe('hashtag recognition', function() {
    it('should find nothing in an null text', function() {
        expect(getHashTags(null)).to.eqls([]);
    });

    it('should find nothing in an undefined text', function() {
        expect(getHashTags()).to.eqls([]);
    });

    it('should find nothing in an empty text', function() {
        expect(getHashTags("")).to.eqls([]);
    });

    it('should find nothing when there is no tag', function() {
        expect(getHashTags("there is no tag")).to.eqls([]);
    });

    it('should find a simple tag', function() {
        expect(getHashTags("#atag")).to.eqls(["atag"]);
    });

    it('should find a tag with having a "_" character', function() {
        expect(getHashTags("#a_tag")).to.eqls(["a_tag"]);
    });

    it('should not find a tag containing only the "_" character', function() {
        expect(getHashTags("This should not be a good tag #___")).to.eqls([]);
    });

    it('should not find a tag containing only the "-" character', function() {
        expect(getHashTags("This should not be a good tag #---")).to.eqls([]);
    });

    it('should not find a tag containing only numerical characters', function() {
        expect(getHashTags("This should not be a good tag #123")).to.eqls([]);
    });

    it('should find a tag with having a "-" character', function() {
        expect(getHashTags("#a-tag")).to.eqls(["a-tag"]);
    });

    it('should find several tags', function() {
        expect(getHashTags("#a-tag and a second #tag")).to.eqls(["a-tag", "tag"]);
    });
});