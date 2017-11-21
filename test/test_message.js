let chai = require('chai');
let expect = chai.expect; // we are using the "expect" style of Chai
let Message = require('../modules/message');

describe('Message constructor', function() {
    it('should return the value passed to the constructor', function() {
        let message = new Message({value: "my content"});
        expect(message.value).to.equal("my content");
    });

    it('should return the an empty value when not passed to constructor', function() {
        let message = new Message();
        expect(message.value).to.equal("");
    });

    it('should return a null from field when not passed to constructor', function() {
        let message = new Message();
        expect(message.from).to.be.a("null");
    })

    it('should return the date passed to the constructor', function() {
        let date = new Date();
        let message = new Message({date: date});
        expect(message.date).to.equal(date);
    });

    it('should return the a default date when not passed to constructor', function() {
        let message = new Message();
        expect(message.date).to.be.a('date');
    });

    it('should return the jid passed to the constructor', function() {
        let date = new Date();
        let message = new Message({jid: "12345@ale.com"});
        expect(message.jid).to.equal("12345@ale.com");
    });

    it('should return an empty jid when not passed to constructor', function() {
        let message = new Message();
        expect(message.jid).to.equal("");
    });

    it('should return the lang passed to the constructor', function() {
        let date = new Date();
        let message = new Message({lang: "fr"});
        expect(message.lang).to.equal("fr");
    });

    it('should return a default "en" language when not passed to constructor', function() {
        let message = new Message();
        expect(message.lang).to.equal("en");
    });

    it('should return the type passed to the constructor', function() {
        let date = new Date();
        let message = new Message({type: "choice"});
        expect(message.type).to.equal("choice");
    });

    it('should return the from passed to the constructor', function() {
        let from = {"jid": "12345"};
        let message = new Message({from: from});
        expect(message.from).to.equal(from);
    });

    it('should return a default "message" type when not passed to constructor', function() {
        let message = new Message();
        expect(message.type).to.equal("message");
    });

    it('should return the tag passed to the constructor', function() {
        let date = new Date();
        let message = new Message({tag: "monaco"});
        expect(message.tag).to.equal("monaco");
    });

    it('should return a null tag when not passed to constructor', function() {
        let message = new Message();
        expect(message.tag).to.be.a ('null');
    });
});

describe('Message setter', function() {
    it('should set the jid', function() {
        let message = new Message();
        message.jid = "12345@ale.com";
        expect(message.jid).to.equal("12345@ale.com");
    });

    it('should set the lang', function() {
        let message = new Message();
        message.lang = "fr";
        expect(message.lang).to.equal("fr");
    });

    it('should set the type', function() {
        let message = new Message();
        message.type = "choice";
        expect(message.type).to.equal("choice");
    });

    it('should set the tag', function() {
        let message = new Message();
        message.tag = "myTag";
        expect(message.tag).to.equal("myTag");
    });

    it('should set the value', function() {
        let message = new Message();
        message.value = "myContent";
        expect(message.value).to.equal("myContent");
    });

    it('should set the from', function() {
        let message = new Message();
        let from = {"jid": "12345"};
        message.from = from;
        expect(message.from).to.equal(from);
    });
});

describe('Message services', function() {
    it('should return false when no tag has been set', function() {
        let message = new Message();
        expect(message.hasTag()).to.equal(false);
    });

    it('should return true if a tag has been set', function() {
        let message = new Message({tag: "12345"});
        expect(message.hasTag()).to.equal(true);
    });

    it('should return true if a tag has been set', function() {
        let message = new Message();
        message.tag = "myTag";
        expect(message.hasTag()).to.equal(true);
    });
});