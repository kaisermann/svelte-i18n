import {
  getFallbackLocale,
  setFallbackLocale,
  isFallbackLocaleOf,
  getFallbackOf,
  getFallbacksOf,
  setInitialLocale,
  getCurrentLocale,
  $locale,
  isRelatedLocale,
} from '../../src/client/stores/locale'

beforeEach(() => {
  setFallbackLocale(undefined)
})

test('sets and gets the fallback locale', () => {
  setFallbackLocale('en')
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

test('gets the next fallback locale of a certain locale', () => {
  expect(getFallbackOf('az-Cyrl-AZ')).toBe('az-Cyrl')
  expect(getFallbackOf('en-US')).toBe('en')
  expect(getFallbackOf('en')).toBe(null)
})

test('gets the global fallback locale if set', () => {
  setFallbackLocale('en')
  expect(getFallbackOf('it')).toBe('en')
})

test('should not get the global fallback as the fallback of itself', () => {
  setFallbackLocale('en')
  expect(getFallbackOf('en')).toBe(null)
})

test('if global fallback locale has a fallback, it should return it', () => {
  setFallbackLocale('en-US')
  expect(getFallbackOf('en-US')).toBe('en')
})

test('gets all fallback locales of a certain locale', () => {
  expect(getFallbacksOf('en-US')).toEqual(['en', 'en-US'])
  expect(getFallbacksOf('en-US')).toEqual(['en', 'en-US'])
  expect(getFallbacksOf('az-Cyrl-AZ')).toEqual(['az', 'az-Cyrl', 'az-Cyrl-AZ'])
})

test('gets all fallback locales of a certain locale including the global fallback locale', () => {
  setFallbackLocale('pt')
  expect(getFallbacksOf('en-US')).toEqual(['en', 'en-US', 'pt'])
  expect(getFallbacksOf('en-US')).toEqual(['en', 'en-US', 'pt'])
  expect(getFallbacksOf('az-Cyrl-AZ')).toEqual([
    'az',
    'az-Cyrl',
    'az-Cyrl-AZ',
    'pt',
  ])
})

test('should not list fallback locale twice', () => {
  setFallbackLocale('pt-BR')
  expect(getFallbacksOf('pt-BR')).toEqual(['pt', 'pt-BR'])
  expect(getFallbacksOf('pt')).toEqual(['pt'])
})
