"use strict";

const winston = require("winston");
const LOG_ID = "STARTER/LOGS - ";

const tsFormat = () => {
    let date = new Date();
    return date.toLocaleDateString() + " " + date.toLocaleTimeString() + " [" + date.valueOf() + "]";
};

const myFormat = winston.format.printf(info => {
    //return `${info.timestamp} [${info._processInfo.pid}] ${info.level}: ${info.message}`;
    return `${tsFormat()} - ${info.level}: ${info.message}`;
});

class Logger {

    constructor() {

        this._logger = winston.createLogger({
            format: winston.format.combine(
                // winston.format.colorize({ all: logColor }),
                winston.format.simple(),
                //winston.format.label({ label: 'right meow!' }),
                winston.format.timestamp(),
                myFormat
                //winston.format.prettyPrint()
            ),
            transports: [
                new (winston.transports.Console)({
                    level: "debug"
                })
            ]
        });

        this._logger.log("debug", LOG_ID + "-------------------------");
        this._logger.log("debug", LOG_ID + "BOT STARTER-KIT");
        this._logger.log("debug", LOG_ID + "constructor()");
    }

    log(level, message) {
        this._logger.log(level, message);
    }

}

module.exports = new Logger();
