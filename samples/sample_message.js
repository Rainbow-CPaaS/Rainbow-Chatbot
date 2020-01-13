// Load Agent & Node SDK
const ChatBot = require("../index");
const NodeSDK = require("rainbow-node-sdk");

// Load bot identity
//const bot = require("./bot.json");          // Load bot identity
const scenario = require("./sample_message.json");  // Load scenario

const json = require('comment-json');
const fs = require('fs');
const botfile = fs.readFileSync("./samples/bot.json");
let txt = botfile.toString();
let bot = json.parse(txt);

json.stringify(bot, null, 2);

let chatbot = null;
let nodeSDK = null;



// Start the SDK
nodeSDK = new NodeSDK(bot);
nodeSDK.start().then( () => {
    // Start the bot
    chatbot = new ChatBot(nodeSDK, scenario);
    return chatbot.start();
}).then( () => {
    chatbot.onMessage((tag, step, content, from, done) => {
        console.log("::: On answer>", tag, step, content, from);

        if(tag === "routing" && step === "choice" && content === "yes") {
            done("end_no");
        } else {
            done();
        }
    }, this);

    chatbot.onTicket((tag, history, from, start, end, state, id) => {
        console.log("::: On ticket>", tag, history, from, start, end, state, id);
    }, this);
});




