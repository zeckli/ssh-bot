#!/usr/bin/env node --harmony
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cli = require("commander");
const signale_1 = require("signale");
const constants_1 = require("./constants");
const commands_1 = require("./commands");
const run = async () => {
    const signale = new signale_1.Signale(constants_1.SIGNALE_SETTING);
    try {
        const bot = new commands_1.default(signale);
        cli.allowUnknownOption();
        constants_1.COMMANDS.forEach(cmd => cli.command(cmd).action(cmd => {
            bot.command = cmd._name;
        }));
        cli.parse(process.argv);
        await bot.dispatch();
    }
    catch (error) {
        signale.error('Oh, ssh-bot ran into some problems :(');
    }
};
run();
