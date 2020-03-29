import { writable } from 'svelte/store'

import { flush, hasLocaleQueue } from '../includes/loaderQueue'
import { getOptions } from '../configs'

import { getClosestAvailableLocale } from './dictionary'
import { $isLoading } from './loading'

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
    const loadingDelay = getOptions().loadingDelay

    let loadingTimer: number

    // if there's no current locale, we don't wait to set isLoading to true
    // because it would break pages when loading the initial locale
    if (
      typeof window !== 'undefined' &&
      getCurrentLocale() != null &&
      loadingDelay
    ) {
      loadingTimer = window.setTimeout(() => $isLoading.set(true), loadingDelay)
    } else {
      $isLoading.set(true)
    }

    return flush(newLocale)
      .then(() => {
        localeSet(newLocale)
      })
      .finally(() => {
        clearTimeout(loadingTimer)
        $isLoading.set(false)
      })
  }
  return localeSet(newLocale)
}

// istanbul ignore next
$locale.update = (fn: (locale: string) => void | Promise<void>) =>
  localeSet(fn(current))

export { $locale }
