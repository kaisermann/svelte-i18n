import {
  getFallbackLocale,
  getLoadingDelay,
  getFormats,
  configure,
} from '../../src/client/configs'

test('configures the fallback locale', () => {
  expect(getFallbackLocale()).toBe(null)
  configure({
    fallbackLocale: 'en',
  })
  expect(getFallbackLocale()).toBe('en')
})
