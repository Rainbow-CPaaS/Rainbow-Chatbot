let chai = require('chai');
let expect = chai.expect; // we are using the "expect" style of Chai
const Tags = require('../modules/tags');
const Message = require("../modules/message");
let spies = require('chai-spies');
let chaiAsPromised = require("chai-as-promised");

chai.use(spies);
chai.use(chaiAsPromised);

describe('Tags constructor', function() {
    it('should create a new Tags', function() {
        let tags = new Tags();
        expect(tags).is.a("object");
    });

    it('should create a new Tags with a list of tags', function() {
        let json = {"tag_a": {}, "tag_b": {}};
        let tags = new Tags(json);
        expect(tags.listOfTags).is.equal(json);
    });
});

describe('Tags start', function() {
    it('should start the Tags', function() {
        let tags = new Tags();
        expect(tags.start()).to.be.fulfilled;
    });
});

describe('Tags definition', function() {
    it('should return true if a tag is in the list', function() {
        let json = {"tag_a": {}, "tag_b": {}};
        let tags = new Tags(json);
        expect(tags.isDefined("tag_a")).is.true;
    });

    it('should return false if a tag is not in the list', function() {
        let json = {"tag_a": {}, "tag_b": {}};
        let tags = new Tags(json);
        expect(tags.isDefined("tag_c")).is.false;
    });

    it('should return false if there is no list', function() {
        let tags = new Tags();
        expect(tags.isDefined("tag_c")).is.false;
    });
});

describe('Tags qualification', function() {
    it('should return null when there is no tag in the message', function() {
        let json = {"tag_a": {}, "tag_b": {}};
        let tags = new Tags(json);
        expect(tags.qualify({"value": "a message without a tag"})).is.a('null');
    });

    it('should return null when there is no tags defined', function() {
        let tags = new Tags(null);
        expect(tags.qualify({"value": "a message with a #tag"})).is.a('null');
    });

    it('should return the scenario associated to an existing tag', function() {
        let scenario = {"step_1": {}};
        let json = {"atag": scenario, "anothertag": {}};
        let tags = new Tags(json);
        expect(tags.qualify({"value": "a message with a #atag"})).to.equal(scenario);
    });

    it('should return the scenario associated to the last tag found', function() {
        let scenario = {"step_1": {}};
        let scenario2 = {"step_2": {}};
        let json = {"atag": scenario, "anothertag": scenario2};
        let tags = new Tags(json);
        expect(tags.qualify({"value": "a message with a #atag and #anothertag"})).to.equal(scenario2);
    });

    it('should change the message type to "command" when a tag is found', function() {
        let scenario = {"step_1": {}};
        let json = {"atag": scenario, "anothertag": {}};
        let tags = new Tags(json);
        let message = {"value": "a message with a #atag"}; 
        tags.qualify(message);
        expect(message.type).to.equal(Message.MESSAGE_TYPE.COMMAND);
    });

    it('should change the message tag to the tag found', function() {
        let scenario = {"step_1": {}};
        let json = {"atag": scenario, "anothertag": {}};
        let tags = new Tags(json);
        let message = {"value": "a message with a #atag"}; 
        tags.qualify(message);
        expect(message.tag).to.equal("atag");
    });
});
