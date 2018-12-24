#!/usr/bin/env node --harmony

import * as cli from 'commander'
import { Signale } from 'signale'
import { COMMANDS, SIGNALE_SETTING } from './constants'
import SSHBot from './commands'

/**
 * Parse input and run ssh-bot up.
 */
const run = async (): Promise<void> => {
  const signale = new Signale(SIGNALE_SETTING)
  try {
    const bot = new SSHBot(signale)
    cli.allowUnknownOption()
    COMMANDS.forEach(cmd =>
      cli.command(cmd).action(cmd => {
        bot.command = cmd._name
      })
    )
    cli.parse(process.argv)
    await bot.dispatch()
  } catch (error) {
    signale.error('Oh, ssh-bot ran into some problems :(')
  }
}

run()
