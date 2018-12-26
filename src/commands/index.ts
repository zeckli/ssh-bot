import * as fs from 'fs'
import * as pty from 'node-pty'
import * as prompts from 'prompts'
import * as rimraf from 'rimraf'
import { Signale } from 'signale'
import { BaseItem, Config, ConfigInfo, Command, Host } from '../types'
import { colorize, showBanner, showHelp } from '../utils'
import { COMMANDS, CONFIG, SIGNALE_SETTING } from '../constants'
import { spacing } from '../decorators'

export default class SSHBot {
  command: Command

  path: string

  file: string

  signale: Signale

  constructor(signale?: Signale) {
    this.path = `${CONFIG.home}/${CONFIG.dir}`
    this.file = `${CONFIG.home}/${CONFIG.dir}/${CONFIG.name}`
    this.signale = signale || new Signale(SIGNALE_SETTING)
  }

  /**
   * Dispatch right task based on user's command, and it only takes one command
   * at a time.
   */
  async dispatch(): Promise<any> {
    switch (this.command) {
      case 'add': {
        return await this.add()
      }
      case 'edit': {
        return await this.edit()
      }
      case 'help': {
        return this.help()
      }
      case 'init': {
        return this.init()
      }
      case 'list': {
        return this.list()
      }
      case 'remove': {
        return await this.remove()
      }
      case 'reset': {
        return this.reset()
      }
      default: {
        return await this.run()
      }
    }
  }

  /**
   * Validate configration file.
   */
  isValidConfig(config: Config): boolean {
    if (!config || !config.hasOwnProperty('hosts')) {
      this.signale.error('Looks like the configuration is not right')
      this.signale.info('Maybe you want to do a rest: $ shb reset')
      return false
    }
    return true
  }

  /**
   * Validate choice data.
   */
  isValidChoice(choice: BaseItem, command: Command): boolean {
    if (!choice || typeof choice[command] != 'number') {
      this.signale.error('Could not get your choice. Please try again')
      return false
    }
    return true
  }

  /**
   * Validate host data.
   */
  isValidHost(item: BaseItem): boolean {
    if (
      !item.hasOwnProperty('host') ||
      !item.hasOwnProperty('hostName') ||
      !item.hasOwnProperty('user') ||
      !item.hasOwnProperty('identityFile')
    ) {
      this.signale.error('Host data is incorrect. Please retry or reset')
      return false
    }
    return true
  }

  /**
   * Get the configuration, and load it as JS object.
   */
  loadConfig(): Config | null {
    if (!fs.existsSync(this.path)) {
      this.signale.warn(
        'Looks like you have not initialize ssh-bot. To initialize: $ shb init'
      )
      return null
    }
    const config = JSON.parse(fs.readFileSync(this.file, 'utf8'))
    return this.isValidConfig(config) ? config : null
  }

  /**
   * Make data into a Host typed object.
   */
  makeHost(item: BaseItem): Host | null {
    if (!this.isValidHost(item)) {
      return null
    }
    const { host, hostName, user, identityFile } = item
    return { host, hostName, user, identityFile } as Host
  }

  /**
   * Make host data as a visual block.
   */
  makeHostBlock(host: Host): string {
    return (
      '\r\n' +
      `  Host:         ${colorize(host.host, 'gray')}\r\n` +
      `  HostName:     ${colorize(host.hostName, 'gray')}\r\n` +
      `  User:         ${colorize(host.user, 'gray')}\r\n` +
      `  IdentityFile: ${colorize(host.identityFile, 'gray')}\r\n` +
      '\r\n'
    )
  }

  /**
   * Make host list for selection.
   */
  makeHostList(command: Command, message: string, config: Config): any[] {
    return [
      {
        type: 'select',
        name: command,
        message,
        choices: config.hosts.map((host: Host, index: number) => {
          return {
            title: `${host.host} (${host.hostName})`,
            value: index
          }
        })
      }
    ]
  }

  /**
   * Make host questions.
   */
  makeHostQuestions(
    host?: string,
    hostName?: string,
    user?: string,
    identityFile?: string
  ): any[] {
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
          `e.g. ${CONFIG.home}/.ssh/credentials.pem`})`
      }
    ]
  }

  /**
   * Make prompt.
   */
  @spacing()
  makePrompt(params: any): Promise<any> {
    return prompts(params)
  }

  /**
   * Make SSH command.
   *
   * For example:
   *   ssh -i /path/to/credentials.pem user@your.doamin.com
   */
  makeSSHCommand(host: BaseItem): string[] | null {
    if (!this.isValidHost(host)) {
      return null
    }
    const { hostName, user, identityFile } = host
    const [node, script, ...params] = process.argv
    return [...params, '-i', `${identityFile}`, `${user}@${hostName}`]
  }

  /**
   * Save the configuration.
   */
  saveConfig(config: Config): void {
    fs.writeFileSync(this.file, JSON.stringify(config, null, 2), 'utf8')
  }

  //------------------------------- Commands ---------------------------------//

  /**
   * Add a new host into configuration.
   *
   * Usage:
   *   $ shb add
   */
  @spacing()
  async add(): Promise<any> {
    this.signale.start('Add host')
    this.signale.note('Please enter a new host info')

    const config = this.loadConfig()
    if (!config) {
      return false
    }

    const questions = this.makeHostQuestions()
    const data: BaseItem = await this.makePrompt(questions)
    const newHost = this.makeHost(data)
    if (!newHost) {
      return false
    }
    config.hosts.push(newHost)
    this.saveConfig(config)
    this.signale.success('The host has been added')
  }

  /**
   * Edit a host data.
   *
   * Usage:
   *   $ shb edit
   */
  @spacing()
  async edit(): Promise<any> {
    this.signale.start('Edit host')

    const config = this.loadConfig()
    if (!config) {
      return false
    }
    if (config.hosts.length === 0) {
      this.signale.warn('Looks like you have not added any hosts')
      return false
    }
    this.signale.note('Select one of the following hosts')

    const list = this.makeHostList('edit', 'Hosts:', config)
    const choice: BaseItem = await this.makePrompt(list)
    if (!this.isValidChoice(choice, 'edit')) {
      return false
    }

    const selectedIndex = choice['edit']
    const selectedHost: Host = config.hosts[selectedIndex]
    const questions = this.makeHostQuestions(
      selectedHost.host,
      selectedHost.hostName,
      selectedHost.user,
      selectedHost.identityFile
    )
    const data: BaseItem = await this.makePrompt(questions)
    const newHost = this.makeHost(data)
    if (!newHost) {
      return false
    }
    config.hosts[selectedIndex] = newHost
    this.saveConfig(config)
    this.signale.success('This host has been updated')
  }

  /**
   * Show help information.
   *
   * Usage:
   *   $ shb help
   */
  @spacing()
  help(): any {
    this.signale.start('Show help information')
    console.log(showBanner('0.1.1'))
    console.log(showHelp())
  }

  /**
   * Initialize ssh-bot by creating a config named `config.json` with seed data
   * under folder `~/.ssh-bot`.
   *
   * Usage:
   *   $ shb init
   */
  @spacing()
  init(): any {
    this.signale.start('Initialize ssh-bot')

    if (!fs.existsSync(this.path)) {
      fs.mkdirSync(this.path)
    }
    if (!fs.existsSync(this.file)) {
      fs.writeFileSync(
        this.file,
        JSON.stringify({ hosts: CONFIG.hosts }, null, 2),
        'utf8'
      )
      this.signale.success(
        'Configuration has been created. To add new host: $ shb add'
      )
    } else {
      this.signale.warn(
        'You have initialized ssh-bot before. To do reset: $ shb reset'
      )
    }
  }

  /**
   * List all added hosts.
   *
   * Usage:
   *   $ shb list
   */
  @spacing()
  list(): any {
    this.signale.start('List hosts')

    const config = this.loadConfig()
    if (!config) {
      return false
    }
    if (config.hosts.length === 0) {
      this.signale.warn('Looks like you have not added any hosts')
      return false
    }

    const hosts = config.hosts
      .map((host: Host) => this.makeHostBlock(host))
      .join('')

    this.signale.note(`Here are hosts you haved added:\r\n${hosts}`)
  }

  /**
   * Remove a host from the current list.
   *
   * Usage:
   *   $ shb remove
   */
  @spacing()
  async remove(): Promise<any> {
    this.signale.start('Remove host')

    const config = this.loadConfig()
    if (!config) {
      return false
    }
    if (config.hosts.length === 0) {
      this.signale.warn('Looks like you have not added any host')
      return false
    }
    this.signale.note('Select one of the following hosts')

    const list = this.makeHostList('remove', 'Hosts:', config)
    const choice: BaseItem = await this.makePrompt(list)
    if (!this.isValidChoice(choice, 'remove')) {
      return false
    }

    config.hosts.splice(choice['remove'], 1)
    this.saveConfig(config)
    this.signale.success('The host has been deleted')
  }

  /**
   * Reset the configuration.
   *
   * Usage:
   *   $ shb reset
   */
  @spacing()
  reset(): any {
    this.signale.start('Reset ssh-bot')

    if (fs.existsSync(this.path)) {
      rimraf.sync(this.path)
    }
    if (!fs.existsSync(this.path)) {
      fs.mkdirSync(this.path)
    }
    fs.writeFileSync(
      this.file,
      JSON.stringify({ hosts: CONFIG.hosts }, null, 2),
      'utf8'
    )

    this.signale.success(
      'Configuration has been recreated. To add host: $ shb add'
    )
  }

  /**
   * Connect a remote server with typical options.
   *
   * Usage:
   *   $ shb [options]
   */
  @spacing()
  async run(): Promise<any> {
    this.signale.start('Connect remote server')

    const config = this.loadConfig()
    if (!config) {
      return false
    }
    if (config.hosts.length === 0) {
      return false
    }

    const list = this.makeHostList('connect', 'Hosts:', config)
    const choice: BaseItem = await this.makePrompt(list)
    if (!this.isValidChoice(choice, 'connect')) {
      return false
    }

    const selectedIndex = choice['connect']
    const selectedHost = config.hosts[selectedIndex]
    const sshCommand = this.makeSSHCommand(selectedHost)
    if (!sshCommand) {
      return false
    }

    this.signale.note(`Excuting: ssh ${sshCommand.join(' ')}`)

    const term: any = pty.spawn('ssh', sshCommand, {
      name: 'xterm-color',
      cols: process.stdout.columns || 120,
      rows: process.stdout.rows || 40,
      cwd: '.'
    })
    const stdin: any = process.stdin
    if (!stdin) {
      throw new Error('Process stdin is undefined')
    }
    stdin.setEncoding('utf8')
    stdin.setRawMode(true)
    stdin.pipe(term)
    term.pipe(process.stdout)
    term.on('close', () => {
      process.exit()
    })
  }
}
