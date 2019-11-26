import { get } from 'svelte/store'

import {
  isFallbackLocaleOf,
  getFallbackOf,
  getRelatedLocalesOf,
  getCurrentLocale,
  $locale,
  isRelatedLocale,
} from '../../src/client/stores/locale'
import { getFallbackLocale, configure } from '../../src/client/configs'

beforeEach(() => {
  configure({ fallbackLocale: undefined })
  $locale.set(undefined)
})

test('sets and gets the fallback locale', () => {
  configure({ fallbackLocale: 'en' })
  expect(getFallbackLocale()).toBe('en')
})

test('checks if a locale is a fallback locale of another locale', () => {
  expect(isFallbackLocaleOf('en', 'en-US')).toBe(true)
  expect(isFallbackLocaleOf('en', 'en')).toBe(false)
  expect(isFallbackLocaleOf('it', 'en-US')).toBe(false)
})

test('checks if a locale is a fallback locale of another locale', () => {
  expect(isRelatedLocale('en', 'en-US')).toBe(true)
  expect(isRelatedLocale('pt-BR', 'pt')).toBe(true)
  expect(isRelatedLocale('en', 'en')).toBe(true)
  expect(isRelatedLocale('en', 'it-IT')).toBe(false)
  expect(isRelatedLocale('en-US', 'it')).toBe(false)
})

test('gets the next fallback locale of a locale', () => {
  expect(getFallbackOf('az-Cyrl-AZ')).toBe('az-Cyrl')
  expect(getFallbackOf('en-US')).toBe('en')
  expect(getFallbackOf('en')).toBe(null)
})

test('gets the global fallback locale if set', () => {
  configure({ fallbackLocale: 'en' })
  expect(getFallbackOf('it')).toBe('en')
})

test('should not get the global fallback as the fallback of itself', () => {
  configure({ fallbackLocale: 'en' })
  expect(getFallbackOf('en')).toBe(null)
})

test('if global fallback locale has a fallback, it should return it', () => {
  configure({ fallbackLocale: 'en-US' })
  expect(getFallbackOf('en-US')).toBe('en')
})

test('gets all fallback locales of a locale', () => {
  expect(getRelatedLocalesOf('en-US')).toEqual(['en', 'en-US'])
  expect(getRelatedLocalesOf('en-US')).toEqual(['en', 'en-US'])
  expect(getRelatedLocalesOf('az-Cyrl-AZ')).toEqual([
    'az',
    'az-Cyrl',
    'az-Cyrl-AZ',
  ])
})

test('gets all fallback locales of a locale including the global fallback locale', () => {
  configure({ fallbackLocale: 'pt' })
  expect(getRelatedLocalesOf('en-US')).toEqual(['en', 'en-US', 'pt'])
  expect(getRelatedLocalesOf('en-US')).toEqual(['en', 'en-US', 'pt'])
  expect(getRelatedLocalesOf('az-Cyrl-AZ')).toEqual([
    'az',
    'az-Cyrl',
    'az-Cyrl-AZ',
    'pt',
  ])
})
test('gets all fallback locales of a locale including the global fallback locale and its fallbacks', () => {
  configure({ fallbackLocale: 'pt-BR' })
  expect(getRelatedLocalesOf('en-US')).toEqual(['en', 'en-US', 'pt', 'pt-BR'])
  expect(getRelatedLocalesOf('en-US')).toEqual(['en', 'en-US', 'pt', 'pt-BR'])
  expect(getRelatedLocalesOf('az-Cyrl-AZ')).toEqual([
    'az',
    'az-Cyrl',
    'az-Cyrl-AZ',
    'pt',
    'pt-BR',
  ])
})

test("don't list fallback locale twice", () => {
  configure({ fallbackLocale: 'pt-BR' })
  expect(getRelatedLocalesOf('pt-BR')).toEqual(['pt', 'pt-BR'])
  expect(getRelatedLocalesOf('pt')).toEqual(['pt'])
})

test('gets the current locale', () => {
  expect(getCurrentLocale()).toBe(undefined)
  $locale.set('es-ES')
  expect(getCurrentLocale()).toBe('es-ES')
})

test('if no initial locale is set, set the locale to the fallback', () => {
  configure({ fallbackLocale: 'pt' })
  expect(get($locale)).toBe('pt')
  expect(getFallbackLocale()).toBe('pt')
})

test('if no initial locale was found, set to the fallback locale', () => {
  configure({
    fallbackLocale: 'en',
    initialLocale: {
      hash: 'lang',
    },
  })
  expect(get($locale)).toBe('en')
  expect(getFallbackLocale()).toBe('en')
})
