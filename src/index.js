import { writable, derived } from 'svelte/store'
import resolvePath from 'object-resolve-path'
import IntlMessageFormat from 'intl-messageformat'
import memoize from 'micro-memoize'
import { capital, title, upper, lower } from './utils.js'

let currentLocale
let currentDictionary

const getMessageFormatter = memoize(
  (message, locale, formats) => new IntlMessageFormat(message, locale, formats),
)

const lookupMessage = memoize((path, locale) => {
  return (
    currentDictionary[locale][path] ||
    resolvePath(currentDictionary[locale], path)
  )
})

const formatMessage = (message, interpolations, locale = currentLocale) => {
  return getMessageFormatter(message, locale).format(interpolations)
}

const getLocalizedMessage = (path, interpolations, locale = currentLocale) => {
  if (typeof interpolations === 'string') {
    locale = interpolations
    interpolations = undefined
  }
  const message = lookupMessage(path, locale)

  if (!message) return path
  if (!interpolations) return message

  return getMessageFormatter(message, locale).format(interpolations)
}

getLocalizedMessage.time = (t, format = 'short', locale) =>
  formatMessage(`{t,time,${format}}`, { t }, locale)

getLocalizedMessage.date = (d, format = 'short', locale) =>
  formatMessage(`{d,date,${format}}`, { d }, locale)

getLocalizedMessage.number = (n, locale) =>
  formatMessage('{n,number}', { n }, locale)

getLocalizedMessage.capital = (path, interpolations, locale) =>
  capital(getLocalizedMessage(path, interpolations, locale))

getLocalizedMessage.title = (path, interpolations, locale) =>
  title(getLocalizedMessage(path, interpolations, locale))

getLocalizedMessage.upper = (path, interpolations, locale) =>
  upper(getLocalizedMessage(path, interpolations, locale))

getLocalizedMessage.lower = (path, interpolations, locale) =>
  lower(getLocalizedMessage(path, interpolations, locale))

const dictionary = writable({})
dictionary.subscribe(newDictionary => {
  currentDictionary = newDictionary
})

const locale = writable({})
locale.subscribe(newLocale => {
  currentLocale = newLocale
})

const format = derived(locale, () => getLocalizedMessage)

export { locale, format as _, format, dictionary }
