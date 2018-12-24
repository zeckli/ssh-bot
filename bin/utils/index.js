"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
exports.colorize = (message, color) => {
    return chalk_1.default.keyword(color)(message);
};
exports.showBanner = (version) => exports.colorize(`
    __|  __| |  |     _ )  _ \\__ __|
  \\__ \\\\__ \\ __ |____|_ \\ (   |  |
  ____/____/_| _|    ___/\\___/  _|

  A dummy ssh hosts management tool (v${version})
`, 'cyan');
exports.showHelp = () => `  Usage: shb [command]

  Commands:

    $ shb [options]
      ${exports.colorize('Start a connection with options.', 'gray')}

    $ shb add
      ${exports.colorize('Add a new host you often connect to.', 'gray')}

    $ shb init
      ${exports.colorize('Create and set up config of ssh-bot.', 'gray')}

    $ shb help
      ${exports.colorize('Display help information.', 'gray')}

    $ shb list
      ${exports.colorize('List all hosts and related information.', 'gray')}

    $ shb edit
      ${exports.colorize('Edit a host.', 'gray')}

    $ shb remove
      ${exports.colorize('Remove a host from the list.', 'gray')}

    $ shb reset
      ${exports.colorize('Reset ssh-bot.', 'gray')}
`;
