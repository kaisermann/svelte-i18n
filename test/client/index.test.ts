import { defineMessages, waitLocale, register, init } from '../../src/client'
import { $locale } from '../../src/client/stores/locale'
import { hasLocaleQueue } from '../../src/client/includes/loaderQueue'
import {
  getLocaleDictionary,
  $dictionary,
} from '../../src/client/stores/dictionary'
import { $format } from '../../src/client/stores/format'

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

describe('changing locale', () => {
  beforeEach(() => {
    init({ fallbackLocale: 'en' })
  })

  test('format store is updated when locale changes', () => {
    const fn = jest.fn()
    const cancel = $format.subscribe(fn)

    $locale.set('pt')
    expect(fn).toHaveBeenCalledTimes(2)
    cancel()
  })

  test('format store is updated when dictionary changes', () => {
    const fn = jest.fn()
    const cancel = $format.subscribe(fn)
    $dictionary.set({})
    expect(fn).toHaveBeenCalledTimes(2)
    cancel()
  })
})
