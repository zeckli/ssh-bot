import { COMMANDS, CONFIG, SIGNALE_SETTING, VERSION } from '../constants'

test('Validation for commands', () => {
  expect(COMMANDS.length).toBe(8)
})

test('Validation for config', () => {
  expect(Object.keys(CONFIG).length).toBe(4)
  expect(CONFIG['dir']).toBe('.ssh-bot')
  expect(CONFIG['name']).toBe('config.json')
})
