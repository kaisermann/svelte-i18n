import { get } from 'svelte/store'

import {
  configure,
  getOptions,
  defaultOptions,
  defaultFormats,
} from '../../src/client/configs'
import { $locale } from '../../src/client/stores/locale'

beforeEach(() => {
  configure(defaultOptions)
})

test('configures the fallback locale', () => {
  expect(getOptions().fallbackLocale).toBe(null)
  configure({
    fallbackLocale: 'en',
  })
  expect(getOptions().fallbackLocale).toBe('en')
})

test('configures the initial locale by string', () => {
  configure({
    fallbackLocale: 'pt',
    initialLocale: 'en',
  })
  expect(getOptions().initialLocale).toBe('en')
  expect(get($locale)).toBe('en')
})

test('configures the initial locale by client heuristics', () => {
  delete window.location
  window.location = {
    search: '?lang=en-US&foo',
    pathname: '/',
    hostname: 'example.com',
    hash: '',
  } as any

  configure({
    fallbackLocale: 'pt',
    initialLocale: {
      search: 'lang',
    },
  })
  expect(getOptions().initialLocale).toBe('en-US')
  expect(get($locale)).toBe('en-US')
})

test('adds custom formats for time, date and number values', () => {
  const customFormats = require('../fixtures/formats.json')

  configure({
    fallbackLocale: 'en',
    formats: customFormats,
  })
  expect(getOptions().formats).toMatchObject(defaultFormats)
  expect(getOptions().formats).toMatchObject(customFormats)
})

test('sets the minimum delay to set the loading store value', () => {
  configure({ fallbackLocale: 'en', loadingDelay: 300 })
  expect(getOptions().loadingDelay).toBe(300)
})
