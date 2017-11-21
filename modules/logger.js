"use strict";

const winston = require("winston");

const tsFormat = () => {
    
        let date = new Date();
    
        return date.toLocaleDateString() + " " + date.toLocaleTimeString() + " [" + date.valueOf() + "]";
    };

class Logger {

    constructor() {

        this._logger = new (winston.Logger)({
            transports: [
                new (winston.transports.Console)({ 
                    colorize: true, 
                    timestamp: tsFormat, 
                    level: "debug" 
                })
            ]
        });
    }

    get log() {
        return this._logger;
    }

}

module.exports = Logger;