import { writable, derived } from 'svelte/store'
import resolvePath from 'object-resolve-path'
import memoize from 'micro-memoize'

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

const hasLocale = (locale: string) => locale in currentDictionary

function getAvailableLocale(locale: string): string | null {
  if (locale in currentDictionary || locale == null) return locale
  return getAvailableLocale(getGenericLocaleFrom(locale))
}

const lookupMessage = memoize((path: string, locale: string): string => {
  if (locale == null) return null
  if (hasLocale(locale)) {
    if (path in currentDictionary[locale]) return currentDictionary[locale][path]
    const message = resolvePath(currentDictionary[locale], path)
    if (message) return message
  }

  return lookupMessage(path, getGenericLocaleFrom(locale))
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
      `[svelte-i18n] The message "${id}" was not found in "${getGenericLocalesFrom(locale).join(
        '", "',
      )}".`,
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

const loadLocale = (localeToLoad: string) => {
  return Promise.all(
    getGenericLocalesFrom(localeToLoad)
      .map(localeItem => {
        const loader = currentDictionary[localeItem]
        if (loader == null && localeItem !== localeToLoad) {
          console.warn(
            `[svelte-i18n] No dictionary or loader were found for the locale "${localeItem}". It's the fallback locale of "${localeToLoad}."`,
          )
          return
        }
        if (typeof loader !== 'function') return
        return loader().then((dict: any) => [localeItem, dict.default || dict])
      })
      .filter(Boolean),
  )
    .then(updates => {
      if (updates.length > 0) {
        // update dictionary only once
        $dictionary.update(d => {
          updates.forEach(([localeItem, localeDict]) => {
            d[localeItem] = localeDict
          })
          return d
        })
      }
      return updates
    })
    .catch((e: Error) => {
      throw e
    })
}

const $locale = writable(null)
const localeSet = $locale.set
$locale.set = (newLocale: string): void | Promise<void> => {
  const locale = getAvailableLocale(newLocale)
  if (locale) {
    if (typeof currentDictionary[locale] === 'function') {
      // load all locales related to the passed locale
      // i.e en-GB loads en, but en doesn't load en-GB
      return loadLocale(locale).then(() => localeSet(newLocale))
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
  $locales,
  getClientLocale,
  defineMessages,
  loadLocale as preloadLocale,
}
