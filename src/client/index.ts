import { writable, derived } from 'svelte/store'
import resolvePath from 'object-resolve-path'
import memoize from 'micro-memoize'

import { capital, title, upper, lower, getClientLocale, getGenericLocaleFrom } from './utils'
import { MessageObject, Formatter } from './types'
import {
  getMessageFormatter,
  getDateFormatter,
  getNumberFormatter,
  getTimeFormatter,
} from './formatters'

let currentLocale: string
let currentDictionary: Record<string, any>

const hasLocale = (locale: string) => locale in currentDictionary

function getAvailableLocale(locale: string): { locale: string; loader?: () => Promise<any> } {
  if (currentDictionary[locale]) {
    if (typeof currentDictionary[locale] === 'function') {
      return { locale, loader: currentDictionary[locale] }
    }
    return { locale }
  }

  locale = getGenericLocaleFrom(locale)
  if (locale != null) {
    return getAvailableLocale(locale)
  }

  return { locale: null }
}

const lookupMessage = memoize((path: string, locale: string): string => {
  if (path in currentDictionary[locale]) {
    return currentDictionary[locale][path]
  }

  const message = resolvePath(currentDictionary[locale], path)
  if (message == null) {
    const genericLocale = getGenericLocaleFrom(locale)
    if (genericLocale != null && hasLocale(genericLocale)) {
      return lookupMessage(path, genericLocale)
    }
    return null
  }

  return message
})

const formatMessage: Formatter = (id, options = {}) => {
  if (typeof id === 'object') {
    options = id as MessageObject
    id = options.id
  }

  const { values, locale = currentLocale, default: defaultValue } = options
  const message = lookupMessage(id, locale)

  if (!message) {
    console.warn(
      `[svelte-i18n] The message "${id}" was not found in "${locale
        .split('-')
        .map((_, i, arr) => arr.slice(0, i + 1).join('-'))
        .reverse()
        .join('", "')}".`,
    )
    if (defaultValue != null) return defaultValue
    return id
  }

  if (!values) return message

  return getMessageFormatter(message, locale).format(values)
}

formatMessage.time = (t, options) => getTimeFormatter(currentLocale, options).format(t)
formatMessage.date = (d, options) => getDateFormatter(currentLocale, options).format(d)
formatMessage.number = (n, options) => getNumberFormatter(currentLocale, options).format(n)
formatMessage.capital = (id, options) => capital(formatMessage(id, options))
formatMessage.title = (id, options) => title(formatMessage(id, options))
formatMessage.upper = (id, options) => upper(formatMessage(id, options))
formatMessage.lower = (id, options) => lower(formatMessage(id, options))

const $dictionary = writable({})
$dictionary.subscribe((newDictionary: any) => (currentDictionary = newDictionary))

const $locale = writable(null)
const localeSet = $locale.set
$locale.set = (newLocale: string): void | Promise<void> => {
  const { locale, loader } = getAvailableLocale(newLocale)
  if (typeof loader === 'function') {
    return loader()
      .then((dict: any) => {
        currentDictionary[locale] = dict.default || dict
        if (locale) return localeSet(locale)
      })
      .catch((e: Error) => {
        throw e
      })
  }

  if (locale) return localeSet(locale)

  throw Error(`[svelte-i18n] Locale "${newLocale}" not found.`)
}
$locale.update = (fn: (locale: string) => void | Promise<void>) => localeSet(fn(currentLocale))
$locale.subscribe((newLocale: string) => (currentLocale = newLocale))

const format = derived([$locale, $dictionary], () => formatMessage)
const locales = derived([$dictionary], ([$dictionary]) => Object.keys($dictionary))

// defineMessages allow us to define and extract dynamic message ids
const defineMessages = (i: Record<string, MessageObject>) => i

export { customFormats, addCustomFormats } from './formatters'
export {
  $locale as locale,
  $dictionary as dictionary,
  locales,
  getClientLocale,
  defineMessages,
  format as _,
  format,
}
