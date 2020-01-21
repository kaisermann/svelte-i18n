import { get } from 'svelte/store'

import { lookup } from '../../../src/runtime/includes/lookup'
import {
  isFallbackLocaleOf,
  getFallbackOf,
  getRelatedLocalesOf,
  getCurrentLocale,
  $locale,
  isRelatedLocale,
} from '../../../src/client/stores/locale'
import { getOptions, init } from '../../../src/client/configs'
import { register } from '../../../src/client'
import { hasLocaleQueue } from '../../../src/client/includes/loaderQueue'
import { getClientLocale } from '../../../src/client/includes/getClientLocale'

beforeEach(() => {
  init({ fallbackLocale: undefined })
  $locale.set(undefined)
})

test('sets and gets the fallback locale', () => {
  init({ fallbackLocale: 'en' })
  expect(getOptions().fallbackLocale).toBe('en')
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
  init({ fallbackLocale: 'en' })
  expect(getFallbackOf('it')).toBe('en')
})

test('should not get the global fallback as the fallback of itself', () => {
  init({ fallbackLocale: 'en' })
  expect(getFallbackOf('en')).toBe(null)
})

test('if global fallback locale has a fallback, it should return it', () => {
  init({ fallbackLocale: 'en-US' })
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
  init({ fallbackLocale: 'pt' })
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
  init({ fallbackLocale: 'pt-BR' })
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
  init({ fallbackLocale: 'pt-BR' })
  expect(getRelatedLocalesOf('pt-BR')).toEqual(['pt', 'pt-BR'])
  expect(getRelatedLocalesOf('pt')).toEqual(['pt'])
})

test('gets the current locale', () => {
  expect(getCurrentLocale()).toBe(undefined)
  $locale.set('es-ES')
  expect(getCurrentLocale()).toBe('es-ES')
})

test('if no initial locale is set, set the locale to the fallback', () => {
  init({ fallbackLocale: 'pt' })
  expect(get($locale)).toBe('pt')
  expect(getOptions().fallbackLocale).toBe('pt')
})

test('if no initial locale was found, set to the fallback locale', () => {
  init({
    fallbackLocale: 'en',
    initialLocale: null,
  })
  expect(get($locale)).toBe('en')
  expect(getOptions().fallbackLocale).toBe('en')
})

test('should flush the queue of the locale when changing the store value', async () => {
  register(
    'en',
    () => new Promise(res => setTimeout(() => res({ foo: 'Foo' }), 50))
  )

  expect(hasLocaleQueue('en')).toBe(true)

  await $locale.set('en')

  expect(hasLocaleQueue('en')).toBe(false)
  expect(lookup('foo', 'en')).toBe('Foo')
})
