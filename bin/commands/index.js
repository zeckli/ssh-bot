"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const pty = require("node-pty");
const prompts = require("prompts");
const rimraf = require("rimraf");
const chalk_1 = require("chalk");
const signale_1 = require("signale");
const utils_1 = require("../utils");
const constants_1 = require("../constants");
const decorators_1 = require("../decorators");
class SSHBot {
    constructor(signale) {
        this.path = `${constants_1.CONFIG.home}/${constants_1.CONFIG.dir}`;
        this.file = `${constants_1.CONFIG.home}/${constants_1.CONFIG.dir}/${constants_1.CONFIG.name}`;
        this.signale = signale || new signale_1.Signale(constants_1.SIGNALE_SETTING);
    }
    async dispatch() {
        if (!this.isValidCommand()) {
            this.showInvalidCommandInfo();
            return false;
        }
        switch (this.command) {
            case 'add': {
                return await this.add();
            }
            case 'edit': {
                return await this.edit();
            }
            case 'help': {
                return this.help();
            }
            case 'init': {
                return this.init();
            }
            case 'list': {
                return this.list();
            }
            case 'remove': {
                return await this.remove();
            }
            case 'reset': {
                return this.reset();
            }
            case 'version': {
                return this.version();
            }
            default: {
                return await this.run();
            }
        }
    }
    isValidCommand() {
        const [node, script, ...params] = process.argv;
        const [command, ...rest] = params || [null, null];
        if (command &&
            !constants_1.COMMANDS.includes(command) &&
            !command.startsWith('-')) {
            return false;
        }
        return true;
    }
    isValidConfig(config) {
        if (!config || !config.hasOwnProperty('hosts')) {
            this.signale.error('Looks like the configuration is not right');
            this.signale.info('Maybe you want to do a rest: $ shb reset');
            return false;
        }
        return true;
    }
    isValidChoice(choice, command) {
        if (!choice || typeof choice[command] != 'number') {
            this.signale.error('Could not get your choice. Please try again');
            return false;
        }
        return true;
    }
    isValidHost(item) {
        if (!item.hasOwnProperty('host') ||
            !item.hasOwnProperty('hostName') ||
            !item.hasOwnProperty('user') ||
            !item.hasOwnProperty('identityFile')) {
            this.signale.error('Host data is incorrect. Please retry or reset');
            return false;
        }
        return true;
    }
    loadConfig() {
        if (!fs.existsSync(this.path)) {
            this.signale.warn('Looks like you have not initialize ssh-bot. To initialize: $ shb init');
            return null;
        }
        const config = JSON.parse(fs.readFileSync(this.file, 'utf8'));
        return this.isValidConfig(config) ? config : null;
    }
    makeHost(item) {
        if (!this.isValidHost(item)) {
            return null;
        }
        const { host, hostName, user, identityFile } = item;
        return { host, hostName, user, identityFile };
    }
    makeHostBlock(host) {
        return ('\r\n' +
            `  Host:         ${utils_1.colorize(host.host, 'gray')}\r\n` +
            `  HostName:     ${utils_1.colorize(host.hostName, 'gray')}\r\n` +
            `  User:         ${utils_1.colorize(host.user, 'gray')}\r\n` +
            `  IdentityFile: ${utils_1.colorize(host.identityFile, 'gray')}\r\n` +
            '\r\n');
    }
    makeHostList(command, message, config) {
        return [
            {
                type: 'select',
                name: command,
                message,
                choices: config.hosts.map((host, index) => {
                    return {
                        title: `${host.host} (${host.hostName})`,
                        value: index
                    };
                })
            }
        ];
    }
    makeHostQuestions(host, hostName, user, identityFile) {
        return [
            {
                type: 'text',
                name: 'host',
                message: `Host (${host || 'e.g. dev-server'}):`
            },
            {
                type: 'text',
                name: 'hostName',
                message: `HostName (${hostName || 'e.g. your.domain.com'}):`
            },
            {
                type: 'text',
                name: 'user',
                message: `User (${user || 'e.g. ubuntu'})`
            },
            {
                type: 'text',
                name: 'identityFile',
                message: `IdentityFile (${identityFile ||
                    `e.g. ${constants_1.CONFIG.home}/.ssh/credentials.pem`})`
            }
        ];
    }
    makePrompt(params) {
        return prompts(params);
    }
    makeSSHCommand(host) {
        if (!this.isValidHost(host)) {
            return null;
        }
        const { hostName, user, identityFile } = host;
        const [node, script, ...params] = process.argv;
        return [...params, '-i', `${identityFile}`, `${user}@${hostName}`];
    }
    saveConfig(config) {
        fs.writeFileSync(this.file, JSON.stringify(config, null, 2), 'utf8');
    }
    showInvalidCommandInfo() {
        this.signale.warn('This command is unavailable. To get more info: $shb help');
    }
    async add() {
        this.signale.start('Add host');
        this.signale.note('Please enter a new host info');
        const config = this.loadConfig();
        if (!config) {
            return false;
        }
        const questions = this.makeHostQuestions();
        const data = await this.makePrompt(questions);
        const newHost = this.makeHost(data);
        if (!newHost) {
            return false;
        }
        config.hosts.push(newHost);
        this.saveConfig(config);
        this.signale.success('The host has been added');
    }
    async edit() {
        this.signale.start('Edit host');
        const config = this.loadConfig();
        if (!config) {
            return false;
        }
        if (config.hosts.length === 0) {
            this.signale.warn('Looks like you have not added any hosts');
            return false;
        }
        this.signale.note('Select one of the following hosts');
        const list = this.makeHostList('edit', 'Hosts:', config);
        const choice = await this.makePrompt(list);
        if (!this.isValidChoice(choice, 'edit')) {
            return false;
        }
        const selectedIndex = choice['edit'];
        const selectedHost = config.hosts[selectedIndex];
        const questions = this.makeHostQuestions(selectedHost.host, selectedHost.hostName, selectedHost.user, selectedHost.identityFile);
        const data = await this.makePrompt(questions);
        const newHost = this.makeHost(data);
        if (!newHost) {
            return false;
        }
        config.hosts[selectedIndex] = newHost;
        this.saveConfig(config);
        this.signale.success('This host has been updated');
    }
    help() {
        this.signale.start('Show help information');
        console.log(utils_1.showBanner(constants_1.VERSION));
        console.log(utils_1.showHelp());
    }
    init() {
        this.signale.start('Initialize ssh-bot');
        if (!fs.existsSync(this.path)) {
            fs.mkdirSync(this.path);
        }
        if (!fs.existsSync(this.file)) {
            fs.writeFileSync(this.file, JSON.stringify({ hosts: constants_1.CONFIG.hosts }, null, 2), 'utf8');
            this.signale.success('Configuration has been created. To add new host: $ shb add');
        }
        else {
            this.signale.warn('You have initialized ssh-bot before. To do reset: $ shb reset');
        }
    }
    list() {
        this.signale.start('List hosts');
        const config = this.loadConfig();
        if (!config) {
            return false;
        }
        if (config.hosts.length === 0) {
            this.signale.warn('Looks like you have not added any hosts');
            return false;
        }
        let hosts = config.hosts
            .map((host) => this.makeHostBlock(host))
            .join('');
        hosts =
            hosts + `\r\n  ${chalk_1.default.magentaBright(`${config.hosts.length}`)} hosts`;
        this.signale.note(`Here are hosts you haved added:\r\n${hosts}`);
    }
    async remove() {
        this.signale.start('Remove host');
        const config = this.loadConfig();
        if (!config) {
            return false;
        }
        if (config.hosts.length === 0) {
            this.signale.warn('Looks like you have not added any host');
            return false;
        }
        this.signale.note('Select one of the following hosts');
        const list = this.makeHostList('remove', 'Hosts:', config);
        const choice = await this.makePrompt(list);
        if (!this.isValidChoice(choice, 'remove')) {
            return false;
        }
        config.hosts.splice(choice['remove'], 1);
        this.saveConfig(config);
        this.signale.success('The host has been deleted');
    }
    reset() {
        this.signale.start('Reset ssh-bot');
        if (fs.existsSync(this.path)) {
            rimraf.sync(this.path);
        }
        if (!fs.existsSync(this.path)) {
            fs.mkdirSync(this.path);
        }
        fs.writeFileSync(this.file, JSON.stringify({ hosts: constants_1.CONFIG.hosts }, null, 2), 'utf8');
        this.signale.success('Configuration has been recreated. To add host: $ shb add');
    }
    async run() {
        this.signale.start('Connect remote server');
        const config = this.loadConfig();
        if (!config) {
            return false;
        }
        if (config.hosts.length === 0) {
            this.signale.warn('Looks like you have not added any hosts');
            return false;
        }
        const list = this.makeHostList('connect', 'Hosts:', config);
        const choice = await this.makePrompt(list);
        if (!this.isValidChoice(choice, 'connect')) {
            return false;
        }
        const selectedIndex = choice['connect'];
        const selectedHost = config.hosts[selectedIndex];
        const sshCommand = this.makeSSHCommand(selectedHost);
        if (!sshCommand) {
            return false;
        }
        this.signale.note(`Excuting: ssh ${sshCommand.join(' ')}`);
        const term = pty.spawn('ssh', sshCommand, {
            name: 'xterm-color',
            cols: process.stdout.columns || 120,
            rows: process.stdout.rows || 40,
            cwd: '.'
        });
        const stdin = process.stdin;
        if (!stdin) {
            throw new Error('Process stdin is undefined');
        }
        stdin.setEncoding('utf8');
        stdin.setRawMode(true);
        stdin.pipe(term);
        term.pipe(process.stdout);
        term.on('close', () => {
            process.exit();
        });
    }
    version() {
        this.signale.start(`version: ${constants_1.VERSION}`);
    }
}
__decorate([
    decorators_1.spacing()
], SSHBot.prototype, "makePrompt", null);
__decorate([
    decorators_1.spacing()
], SSHBot.prototype, "showInvalidCommandInfo", null);
__decorate([
    decorators_1.spacing()
], SSHBot.prototype, "add", null);
__decorate([
    decorators_1.spacing()
], SSHBot.prototype, "edit", null);
__decorate([
    decorators_1.spacing()
], SSHBot.prototype, "help", null);
__decorate([
    decorators_1.spacing()
], SSHBot.prototype, "init", null);
__decorate([
    decorators_1.spacing()
], SSHBot.prototype, "list", null);
__decorate([
    decorators_1.spacing()
], SSHBot.prototype, "remove", null);
__decorate([
    decorators_1.spacing()
], SSHBot.prototype, "reset", null);
__decorate([
    decorators_1.spacing()
], SSHBot.prototype, "run", null);
__decorate([
    decorators_1.spacing()
], SSHBot.prototype, "version", null);
exports.default = SSHBot;
