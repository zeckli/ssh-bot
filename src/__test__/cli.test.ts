import * as fs from 'fs'
import * as prompts from 'prompts'
import { BaseItem, Config, ConfigInfo, Command, Host } from '../types'
import { CONFIG } from '../constants'
import SSHBot from '../commands'

const bot = new SSHBot()

const config = { hosts: [] }

const host = { host: '', hostName: '', user: '', identityFile: '' }

test('Validation for dispatch', () => {})

test('Validation for isValidCommand', () => {
  expect(bot.isValidCommand()).toBeTruthy()
})

test('Validation for config hosts', () => {
  expect(bot.path).not.toBeNull()
  expect(bot.path).not.toBeUndefined()
  expect(bot.file).not.toBeNull()
  expect(bot.file).not.toBeUndefined()
})

test('Validation for config file', () => {
  expect(bot.isValidConfig({ hosts: [] })).toBeTruthy()
})

test('Validation for selected choice', () => {
  expect(bot.isValidChoice({ add: 1 }, 'add')).toBeTruthy()
  expect(bot.isValidChoice({ add: '1' }, 'add')).toBeFalsy()
  expect(bot.isValidChoice({ add: null }, 'add')).toBeFalsy()
  expect(bot.isValidChoice({ add: undefined }, 'add')).toBeFalsy()
})

test('Validation for host data', () => {
  expect(bot.isValidHost({ host: '' })).toBeFalsy()
  expect(bot.isValidHost({ host: '', hostName: '' })).toBeFalsy()
  expect(bot.isValidHost({ host: '', hostName: '', user: '' })).toBeFalsy()
  expect(bot.isValidHost(host)).toBeTruthy()
})

test('Making host data', () => {
  expect(bot.makeHost({ host: '' })).toBeNull()
  expect(bot.makeHost({ host: '', hostName: '' })).toBeNull()
  expect(bot.makeHost({ host: '', hostName: '', user: '' })).toBeNull()
  expect(bot.makeHost(host)).toMatchObject(host)
  expect(bot.makeHost({ ...host, test: '' })).toMatchObject(host)
})

test('Making host block', () => {
  expect(bot.makeHostBlock(host)).not.toBeNull()
  expect(bot.makeHostBlock(host)).not.toBeUndefined()
})

test('Making host list', () => {
  const list = bot.makeHostList('connect', 'Hosts', config)
  expect(list).not.toBeNull()
  expect(list).not.toBeUndefined()
  expect(list[0]).toMatchObject({
    type: 'select',
    name: 'connect',
    message: 'Hosts',
    choices: []
  })
})

test('Making host questions', () => {
  expect(bot.makeHostQuestions()).toMatchObject([
    {
      type: 'text',
      name: 'host',
      message: 'Host (e.g. dev-server):'
    },
    {
      type: 'text',
      name: 'hostName',
      message: 'HostName (e.g. your.domain.com):'
    },
    {
      type: 'text',
      name: 'user',
      message: 'User (e.g. ubuntu)'
    },
    {
      type: 'text',
      name: 'identityFile',
      message: `IdentityFile (e.g. ${CONFIG.home}/.ssh/credentials.pem)`
    }
  ])
})

test('Making SSH command', () => {
  expect(bot.makeSSHCommand({ host: '' })).toBeNull()
  expect(bot.makeSSHCommand({ host: '', hostName: '' })).toBeNull()
  expect(bot.makeSSHCommand({ host: '', hostName: '', user: '' })).toBeNull()
  expect(bot.makeSSHCommand(host)).toMatchObject(['-i', '', '@'])
})

test('Initializing ssh-bot', () => {
  bot.init()
  const testConfig = bot.loadConfig()
  expect(testConfig).toMatchObject(config)
})

test('Adding host', async () => {
  prompts.inject(['server', '0.0.0.0', 'ubuntu', '/path/to/key.pem'])
  await bot.add()
  const testConfig = bot.loadConfig()
  expect(testConfig).toMatchObject({
    hosts: [
      {
        host: 'server',
        hostName: '0.0.0.0',
        user: 'ubuntu',
        identityFile: '/path/to/key.pem'
      }
    ]
  })
})

test('Editing host', async () => {
  prompts.inject([
    0,
    'test-server',
    '0.0.0.1',
    'ssh-bot',
    '/path/to/the/key.pem'
  ])
  await bot.edit()
  const testConfig = bot.loadConfig()
  expect(testConfig).toMatchObject({
    hosts: [
      {
        host: 'test-server',
        hostName: '0.0.0.1',
        user: 'ssh-bot',
        identityFile: '/path/to/the/key.pem'
      }
    ]
  })
})

test('Removing host', async () => {
  prompts.inject([0])
  await bot.remove()
  const testConfig = bot.loadConfig()
  expect(testConfig).toMatchObject(config)
})

test('Reseting ssh-bot', () => {
  bot.reset()
  const testConfig = bot.loadConfig()
  expect(testConfig).toMatchObject(config)
})
