import { Formatter } from '../../../src/client/types/index'
import { $format } from '../../../src/client/stores/format'
import { init } from '../../../src/client/configs'
import { addMessages } from '../../../src/client/stores/dictionary'
import { $locale } from '../../../src/client/stores/locale'

let format: Formatter
$format.subscribe(f => (format = f))

addMessages('en', require('../../fixtures/en.json'))
addMessages('en-GB', require('../../fixtures/en-GB.json'))
addMessages('pt', require('../../fixtures/pt.json'))
addMessages('pt-BR', require('../../fixtures/pt-BR.json'))
addMessages('pt-PT', require('../../fixtures/pt-PT.json'))

beforeEach(() => {
  init({ fallbackLocale: 'en' })
})

test('formats a message by its id and the current locale', () => {
  expect(format({ id: 'form.field_1_name' })).toBe('Name')
})

test('formats a message by its id and the a passed locale', () => {
  expect(format({ id: 'form.field_1_name', locale: 'pt' })).toBe('Nome')
})

test('formats a message with interpolated values', () => {
  expect(format({ id: 'photos', values: { n: 0 } })).toBe('You have no photos.')
  expect(format({ id: 'photos', values: { n: 1 } })).toBe('You have one photo.')
  expect(format({ id: 'photos', values: { n: 21 } })).toBe(
    'You have 21 photos.'
  )
})

test('accepts a message id as first argument', () => {
  expect(format('form.field_1_name')).toBe('Name')
})

test('accepts a message id as first argument and formatting options as second', () => {
  expect(format('form.field_1_name', { locale: 'pt' })).toBe('Nome')
})

test('throws if no locale is set', () => {
  $locale.set(null)
  expect(() => format('form.field_1_name')).toThrow(
    '[svelte-i18n] Cannot format a message without first setting the initial locale.'
  )
})

test('uses a missing message default value', () => {
  expect(format('missing', { default: 'Missing Default' })).toBe(
    'Missing Default'
  )
})

test('warn on missing messages', () => {
  const warn = global.console.warn
  global.console.warn = jest.fn()

  format('missing')

  expect(console.warn).toBeCalledWith(
    `[svelte-i18n] The message "missing" was not found in "en".`
  )

  global.console.warn = warn
})

describe('format utilities', () => {
  test('timeFormatter', () => {
    expect(format.timeFormatter().format(new Date(2019, 0, 1, 20, 37))).toBe('8:37 PM')
  })
  test('time', () => {
    expect(format.time(new Date(2019, 0, 1, 20, 37))).toBe('8:37 PM')
  })
  test('date', () => {
    expect(format.date(new Date(2019, 0, 1, 20, 37))).toBe('1/1/19')
  })
  test('number', () => {
    expect(format.number(123123123)).toBe('123,123,123')
  })
  test('capital', () => {
    expect(format.capital('title')).toBe('Page title')
  })
  test('title', () => {
    expect(format.title('title')).toBe('Page Title')
  })
  test('upper', () => {
    expect(format.upper('title')).toBe('PAGE TITLE')
  })
  test('lower', () => {
    expect(format.lower('title')).toBe('page title')
  })
})
