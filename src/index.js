import { writable, derived } from 'svelte/store/index.js'
import resolvePath from 'object-resolve-path'
import IntlMessageFormat from 'intl-messageformat'
import memoize from 'micro-memoize'

import { capital, title, upper, lower, getClientLocale } from './utils.js'

let currentLocale
let currentDictionary

const customFormats = {
  number: {
    scientific: { notation: 'scientific' },
    engineering: { notation: 'engineering' },
    compactLong: { notation: 'compact', compactDisplay: 'long' },
    compactShort: { notation: 'compact', compactDisplay: 'short' },
  },
}

function addCustomFormats(formats) {
  if ('number' in formats) Object.assign(customFormats.number, formats.number)
  if ('date' in formats) Object.assign(customFormats.date, formats.date)
  if ('time' in formats) Object.assign(customFormats.time, formats.time)
}

function getAvailableLocale(newLocale) {
  if (currentDictionary[newLocale]) return newLocale

  // istanbul ignore else
  if (typeof newLocale === 'string') {
    const fallbackLocale = newLocale.split('-').shift()

    if (currentDictionary[fallbackLocale]) {
      return fallbackLocale
    }
  }

  return null
}

const getMessageFormatter = memoize(
  (message, locale) => new IntlMessageFormat(message, locale, customFormats),
)

const lookupMessage = memoize((path, locale) => {
  return (
    currentDictionary[locale][path] ||
    resolvePath(currentDictionary[locale], path)
  )
})

function formatString(string, { values, locale = currentLocale } = {}) {
  return getMessageFormatter(string, locale).format(values)
}

function formatMessage(path, { values, locale = currentLocale } = {}) {
  const message = lookupMessage(path, locale)

  if (!message) {
    console.warn(
      `[svelte-i18n] The message "${path}" was not found in the locale "${locale}".`,
    )
    return path
  }

  if (!values) return message

  return getMessageFormatter(message, locale).format(values)
}

formatMessage.time = (t, { format = 'short' } = {}) =>
  formatString(`{t,time,${format}}`, { values: { t } })

formatMessage.date = (d, { format = 'short' } = {}) =>
  formatString(`{d,date,${format}}`, { values: { d } })

formatMessage.number = (n, { format } = {}) =>
  formatString(`{n,number,${format}}`, { values: { n } })

formatMessage.capital = (path, options) => capital(formatMessage(path, options))

formatMessage.title = (path, options) => title(formatMessage(path, options))

formatMessage.upper = (path, options) => upper(formatMessage(path, options))

formatMessage.lower = (path, options) => lower(formatMessage(path, options))

const dictionary = writable({})
dictionary.subscribe(newDictionary => {
  currentDictionary = newDictionary
})

const locale = writable({})
const localeSet = locale.set
locale.set = newLocale => {
  const availableLocale = getAvailableLocale(newLocale)
  if (availableLocale) {
    return localeSet(availableLocale)
  }

  throw Error(`[svelte-i18n] Locale "${newLocale}" not found.`)
}
locale.update = fn => localeSet(fn(currentLocale))
locale.subscribe(newLocale => {
  currentLocale = newLocale
})

const format = derived([locale, dictionary], () => formatMessage)

export {
  locale,
  format as _,
  format,
  formatString,
  dictionary,
  getClientLocale,
  customFormats,
  addCustomFormats,
}
