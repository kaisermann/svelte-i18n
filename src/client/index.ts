import { writable, derived } from 'svelte/store'
import resolvePath from 'object-resolve-path'
import merge from 'deepmerge'

import {
  capital,
  title,
  upper,
  lower,
  getClientLocale,
  getGenericLocaleFrom,
  getGenericLocalesFrom,
} from './utils'
import { MessageObject, Formatter } from './types'
import {
  getMessageFormatter,
  getDateFormatter,
  getNumberFormatter,
  getTimeFormatter,
} from './formatters'

let currentLocale: string
let currentDictionary: Record<string, Record<string, any>>
const dictQueue: Record<string, any[]> = {}

const hasLocale = (locale: string) => locale in currentDictionary

async function registerLocaleLoader(locale: string, loader: any) {
  if (!(locale in currentDictionary)) {
    $dictionary.update(d => {
      d[locale] = {}
      return d
    })
  }
  if (!(locale in dictQueue)) dictQueue[locale] = []
  dictQueue[locale].push(loader)
}
function getAvailableLocale(locale: string): string | null {
  if (locale in currentDictionary || locale in dictQueue || locale == null) return locale
  return getAvailableLocale(getGenericLocaleFrom(locale))
}

const lookupCache: Record<string, Record<string, string>> = {}
const addToCache = (path: string, locale: string, message: string) => {
  if (!(locale in lookupCache)) lookupCache[locale] = {}
  if (!(path in lookupCache[locale])) lookupCache[locale][path] = message
  return message
}
const invalidateLookupCache = (locale: string) => {
  delete lookupCache[locale]
}
const lookupMessage = (path: string, locale: string): string => {
  if (locale == null) return null
  if (locale in lookupCache && path in lookupCache[locale]) {
    return lookupCache[locale][path]
  }
  if (hasLocale(locale)) {
    if (path in currentDictionary[locale]) {
      return addToCache(path, locale, currentDictionary[locale][path])
    }
    const message = resolvePath(currentDictionary[locale], path)
    if (message) return addToCache(path, locale, message)
  }

  return lookupMessage(path, getGenericLocaleFrom(locale))
}

const formatMessage: Formatter = (id, options = {}) => {
  if (typeof id === 'object') {
    options = id as MessageObject
    id = options.id
  }

  const { values, locale = currentLocale, default: defaultValue } = options

  if (locale == null) {
    throw new Error(
      '[svelte-i18n] Cannot format a message without first setting the initial locale.'
    )
  }

  const message = lookupMessage(id, locale)

  if (!message) {
    console.warn(
      `[svelte-i18n] The message "${id}" was not found in "${getGenericLocalesFrom(locale).join(
        '", "'
      )}".`
    )
    return defaultValue || id
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

const $dictionary = writable<Record<string, Record<string, any>>>({})
$dictionary.subscribe(newDictionary => (currentDictionary = newDictionary))

function loadLocale(localeToLoad: string) {
  return Promise.all(
    getGenericLocalesFrom(localeToLoad).map(localeItem =>
      flushLocaleQueue(localeItem)
        .then(() => [localeItem, { err: undefined }])
        .catch(e => [localeItem, { err: e }])
    )
  )
}

async function flushLocaleQueue(locale: string = currentLocale) {
  if (!(locale in dictQueue)) return
  return Promise.all(dictQueue[locale].map((loader: any) => loader())).then(partials => {
    dictQueue[locale] = []

    partials = partials.map(partial => partial.default || partial)
    invalidateLookupCache(locale)
    $dictionary.update(d => {
      d[locale] = merge.all<any>([d[locale] || {}].concat(partials))
      return d
    })
  })
}

const $locale = writable(null)
const localeSet = $locale.set
$locale.set = (newLocale: string): void | Promise<void> => {
  const locale = getAvailableLocale(newLocale)
  if (locale) {
    if (locale in dictQueue && dictQueue[locale].length > 0) {
      return flushLocaleQueue(locale).then(() => localeSet(newLocale))
    }
    return localeSet(newLocale)
  }

  throw Error(`[svelte-i18n] Locale "${newLocale}" not found.`)
}
$locale.update = (fn: (locale: string) => void | Promise<void>) => localeSet(fn(currentLocale))
$locale.subscribe((newLocale: string) => (currentLocale = newLocale))

const $format = derived([$locale, $dictionary], () => formatMessage)
const $locales = derived([$dictionary], ([$dictionary]) => Object.keys($dictionary))

// defineMessages allow us to define and extract dynamic message ids
const defineMessages = (i: Record<string, MessageObject>) => i

export { customFormats, addCustomFormats } from './formatters'
export {
  $locale as locale,
  $dictionary as dictionary,
  $format as _,
  $format as format,
  $locales as locales,
  getClientLocale,
  defineMessages,
  loadLocale as preloadLocale,
  registerLocaleLoader,
  flushLocaleQueue,
}
