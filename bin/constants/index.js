"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const figures = require("figures");
exports.COMMANDS = [
    'add',
    'edit',
    'help',
    'init',
    'list',
    'remove',
    'reset'
];
exports.CONFIG = {
    dir: '.ssh-bot',
    home: process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE || '',
    name: 'config.json',
    hosts: []
};
exports.SIGNALE_SETTING = {
    scope: 'ssh-bot',
    types: {
        error: {
            badge: figures.cross,
            color: 'redBright',
            label: 'Error'
        },
        info: {
            badge: '',
            color: 'whiteBright',
            label: ''
        },
        note: {
            badge: figures.bullet,
            color: 'magentaBright',
            label: 'Note'
        },
        warn: {
            badge: figures.warning,
            color: 'yellowBright',
            label: 'Warn'
        },
        success: {
            badge: figures.tick,
            color: 'greenBright',
            label: 'Success'
        },
        start: {
            badge: figures.play,
            color: 'cyanBright',
            label: 'Running'
        }
    }
};
