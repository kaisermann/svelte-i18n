
import { get } from 'svelte/store'

import {
  $format,
  $formatTime,
  $formatDate,
  $formatNumber,
} from '../../../src/runtime/stores/formatters'
import { init } from '../../../src/runtime/configs'
import { addMessages } from '../../../src/runtime/stores/dictionary'
import { $locale } from '../../../src/runtime/stores/locale'
import { MessageFormatter ,
  TimeFormatter,
  DateFormatter,
  NumberFormatter,
} from '../../../src/runtime/types'


let formatMessage: MessageFormatter
let formatTime: TimeFormatter
let formatDate: DateFormatter
let formatNumber: NumberFormatter
$locale.subscribe(() => {
  formatMessage = get($format)
  formatTime = get($formatTime)
  formatDate = get($formatDate)
  formatNumber = get($formatNumber)
})

addMessages('en', require('../../fixtures/en.json'))
addMessages('en-GB', require('../../fixtures/en-GB.json'))
addMessages('pt', require('../../fixtures/pt.json'))
addMessages('pt-BR', require('../../fixtures/pt-BR.json'))
addMessages('pt-PT', require('../../fixtures/pt-PT.json'))

beforeEach(() => {
  init({ fallbackLocale: 'en' })
})

test('formats a message by its id and the current locale', () => {
  expect(formatMessage({ id: 'form.field_1_name' })).toBe('Name')
})

test('formats a message by its id and the a passed locale', () => {
  expect(formatMessage({ id: 'form.field_1_name', locale: 'pt' })).toBe('Nome')
})

test('formats a message with interpolated values', () => {
  expect(formatMessage({ id: 'photos', values: { n: 0 } })).toBe(
    'You have no photos.'
  )
  expect(formatMessage({ id: 'photos', values: { n: 1 } })).toBe(
    'You have one photo.'
  )
  expect(formatMessage({ id: 'photos', values: { n: 21 } })).toBe(
    'You have 21 photos.'
  )
})

test('accepts a message id as first argument', () => {
  expect(formatMessage('form.field_1_name')).toBe('Name')
})

test('accepts a message id as first argument and formatting options as second', () => {
  expect(formatMessage('form.field_1_name', { locale: 'pt' })).toBe('Nome')
})

test('throws if no locale is set', () => {
  $locale.set(null)
  expect(() => formatMessage('form.field_1_name')).toThrow(
    '[svelte-i18n] Cannot format a message without first setting the initial locale.'
  )
})

test('uses a missing message default value', () => {
  expect(formatMessage('missing', { default: 'Missing Default' })).toBe(
    'Missing Default'
  )
})

test('warn on missing messages', () => {
  const warn = global.console.warn
  global.console.warn = jest.fn()

  formatMessage('missing')

  expect(console.warn).toBeCalledWith(
    `[svelte-i18n] The message "missing" was not found in "en".`
  )

  global.console.warn = warn
})

describe('format utilities', () => {
  test('time', () => {
    expect(formatTime(new Date(2019, 0, 1, 20, 37))).toBe('8:37 PM')
  })
  test('date', () => {
    expect(formatDate(new Date(2019, 0, 1, 20, 37))).toBe('1/1/19')
  })
  test('number', () => {
    expect(formatNumber(123123123)).toBe('123,123,123')
  })
})
