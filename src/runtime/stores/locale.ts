import { writable } from 'svelte/store'

import { flush, hasLocaleQueue } from '../includes/loaderQueue'
import { getOptions } from '../configs'

import { getClosestAvailableLocale } from './dictionary'

let current: string
const $locale = writable(null)

export function isFallbackLocaleOf(localeA: string, localeB: string) {
  return localeB.indexOf(localeA) === 0 && localeA !== localeB
}

export function isRelatedLocale(localeA: string, localeB: string) {
  return (
    localeA === localeB ||
    isFallbackLocaleOf(localeA, localeB) ||
    isFallbackLocaleOf(localeB, localeA)
  )
}

export function getFallbackOf(locale: string) {
  const index = locale.lastIndexOf('-')
  if (index > 0) return locale.slice(0, index)

  const { fallbackLocale } = getOptions()
  if (fallbackLocale && !isRelatedLocale(locale, fallbackLocale)) {
    return fallbackLocale
  }

  return null
}

export function getRelatedLocalesOf(locale: string): string[] {
  const locales = locale
    .split('-')
    .map((_, i, arr) => arr.slice(0, i + 1).join('-'))

  const { fallbackLocale } = getOptions()
  if (fallbackLocale && !isRelatedLocale(locale, fallbackLocale)) {
    return locales.concat(getRelatedLocalesOf(fallbackLocale))
  }
  return locales
}

export function getCurrentLocale() {
  return current
}

$locale.subscribe((newLocale: string) => {
  current = newLocale

  if (typeof window !== 'undefined') {
    document.documentElement.setAttribute('lang', newLocale)
  }
})

const localeSet = $locale.set
$locale.set = (newLocale: string): void | Promise<void> => {
  if (getClosestAvailableLocale(newLocale) && hasLocaleQueue(newLocale)) {
    return flush(newLocale).then(() => localeSet(newLocale))
  }
  return localeSet(newLocale)
}

// istanbul ignore next
$locale.update = (fn: (locale: string) => void | Promise<void>) =>
  localeSet(fn(current))

export { $locale }
