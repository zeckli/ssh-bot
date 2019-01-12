import { colorize, showBanner, showHelp } from '../utils'

test('Validation for coloarize', () => {
  expect(colorize('test case', 'cyan')).not.toBeNull()
  expect(colorize('test case', 'cyan')).not.toBeUndefined()
})

test('Validation for showBanner', () => {
  expect(showBanner('')).not.toBeNull()
  expect(showBanner('')).not.toBeUndefined()
})

test('Validation for showHelp', () => {
  expect(showHelp()).not.toBeNull()
  expect(showHelp()).not.toBeUndefined()
})
