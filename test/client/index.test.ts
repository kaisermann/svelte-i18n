import { defineMessages, waitLocale, register, init } from '../../src/client'
import { $locale } from '../../src/client/stores/locale'
import { hasLocaleQueue } from '../../src/client/includes/loaderQueue'
import {
  getLocaleDictionary,
  $dictionary,
} from '../../src/client/stores/dictionary'

test('defineMessages returns the identity of its first argument', () => {
  const obj = {}
  expect(obj).toBe(defineMessages(obj))
})

describe('waiting for a locale to load', () => {
  beforeEach(() => {
    $dictionary.set({})
    $locale.set(undefined)
  })

  test('should wait for a locale queue to be flushed', async () => {
    register('en', () => Promise.resolve({ foo: 'foo' }))
    $locale.set('en')

    await waitLocale('en')

    expect(hasLocaleQueue('en')).toBe(false)
    expect(getLocaleDictionary('en')).toMatchObject({ foo: 'foo' })
  })

  test('should wait for the current locale queue to be flushed', async () => {
    register('en', () => Promise.resolve({ foo: 'foo' }))
    init({ fallbackLocale: 'pt', initialLocale: 'en' })

    await waitLocale()

    expect(hasLocaleQueue('en')).toBe(false)
    expect(getLocaleDictionary('en')).toMatchObject({ foo: 'foo' })
  })

  test('should wait for the fallback locale queue to be flushed if initial not set', async () => {
    register('pt', () => Promise.resolve({ foo: 'foo' }))
    init({ fallbackLocale: 'pt' })

    await waitLocale()

    expect(hasLocaleQueue('pt')).toBe(false)
    expect(getLocaleDictionary('pt')).toMatchObject({ foo: 'foo' })
  })
})
