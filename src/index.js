import { writable, derived } from 'svelte/store'
import resolvePath from 'object-resolve-path'
import IntlMessageFormat from 'intl-messageformat'
import memoizeConstructor from 'intl-format-cache'

const capital = str => str.replace(/(^|\s)\S/, l => l.toUpperCase())
const title = str => str.replace(/(^|\s)\S/g, l => l.toUpperCase())
const upper = str => str.toLocaleUpperCase()
const lower = str => str.toLocaleLowerCase()

let currentLocale
let currentDictionary

const getMessageFormatter = memoizeConstructor(IntlMessageFormat)

function lookupMessage(path, locale) {
  // TODO improve perf here
  return (
    currentDictionary[locale][path] ||
    resolvePath(currentDictionary[locale], path)
  )
}

function formatMessage(message, interpolations, locale = currentLocale) {
  return getMessageFormatter(message, locale).format(interpolations)
}

function getLocalizedMessage(path, interpolations, locale = currentLocale) {
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
