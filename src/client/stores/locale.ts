import { writable } from 'svelte/store'

import { getGenericLocaleFrom, getLocalesFrom } from '../includes/utils'
import { flushQueue, hasLocaleQueue } from '../includes/loaderQueue'

import { getDictionary } from './dictionary'

let current: string
const $locale = writable(null)

function getCurrentLocale() {
  return current
}

function getAvailableLocale(locale: string): string | null {
  if (locale in getDictionary() || locale == null) return locale
  return getAvailableLocale(getGenericLocaleFrom(locale))
}

function loadLocale(localeToLoad: string) {
  return Promise.all(
    getLocalesFrom(localeToLoad).map(localeItem =>
      flushQueue(localeItem)
        .then(() => [localeItem, { err: undefined }])
        .catch(e => [localeItem, { err: e }])
    )
  )
}

$locale.subscribe((newLocale: string) => {
  current = newLocale

  if (typeof window !== 'undefined') {
    document.documentElement.setAttribute('lang', newLocale)
  }
})

const localeSet = $locale.set
$locale.set = (newLocale: string): void | Promise<void> => {
  if (getAvailableLocale(newLocale)) {
    if (hasLocaleQueue(newLocale)) {
      return flushQueue(newLocale).then(() => localeSet(newLocale))
    }
    return localeSet(newLocale)
  }

  throw Error(`[svelte-i18n] Locale "${newLocale}" not found.`)
}

$locale.update = (fn: (locale: string) => void | Promise<void>) =>
  localeSet(fn(current))

export { $locale, loadLocale, flushQueue, getCurrentLocale }
