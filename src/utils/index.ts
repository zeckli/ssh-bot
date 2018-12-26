import chalk from 'chalk'

export const colorize = (message: string, color: string): string => {
  return chalk.keyword(color)(message)
}

export const showBanner = (version: string): string =>
  colorize(
    `
    __|  __| |  |     _ )  _ \\__ __|
  \\__ \\\\__ \\ __ |____|_ \\ (   |  |
  ____/____/_| _|    ___/\\___/  _|

  A dummy ssh hosts management tool (v${version})
`,
    'cyan'
  )

export const showHelp = (): string => `  Usage: shb [command]

  Commands:

    $ shb [options]
      ${colorize('Start a connection with options.', 'gray')}

    $ shb add
      ${colorize('Add a new host you often connect to.', 'gray')}

    $ shb init
      ${colorize('Create and set up config of ssh-bot.', 'gray')}

    $ shb help
      ${colorize('Display help information.', 'gray')}

    $ shb list
      ${colorize('List all hosts and related information.', 'gray')}

    $ shb edit
      ${colorize('Edit a host.', 'gray')}

    $ shb remove
      ${colorize('Remove a host from the list.', 'gray')}

    $ shb reset
      ${colorize('Reset ssh-bot.', 'gray')}

    $ shb version
      ${colorize('Show current version.', 'gray')}
`
