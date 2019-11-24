import { writable } from 'svelte/store'

import { flushQueue, hasLocaleQueue } from '../includes/loaderQueue'
import { getClientLocale } from '../includes/utils'
import { GetClientLocaleOptions } from '../types'

import { getAvailableLocale } from './dictionary'

let fallback: string = null
let current: string
const $locale = writable(null)

export function getFallbackLocale() {
  return fallback
}

export function setfallbackLocale(locale: string) {
  fallback = locale
}

export function isFallbackLocaleOf(localeA: string, localeB: string) {
  return localeB.indexOf(localeA) === 0
}

export function getFallbackOf(locale: string) {
  const index = locale.lastIndexOf('-')
  if (index > 0) return locale.slice(0, index)
  if (fallback && !isFallbackLocaleOf(fallback, locale)) return fallback
  return null
}

export function getFallbacksOf(locale: string): string[] {
  const locales = locale
    .split('-')
    .map((_, i, arr) => arr.slice(0, i + 1).join('-'))

  if (fallback != null && !isFallbackLocaleOf(fallback, locale)) {
    return locales.concat(getFallbacksOf(fallback))
  }
  return locales
}

function getCurrentLocale() {
  return current
}

export function setInitialLocale(options: GetClientLocaleOptions) {
  if (typeof options.fallback === 'string') {
    setfallbackLocale(options.fallback)
  }
  return $locale.set(getClientLocale(options))
}

$locale.subscribe((newLocale: string) => {
  current = newLocale

  if (typeof window !== 'undefined') {
    document.documentElement.setAttribute('lang', newLocale)
  }
})

const localeSet = $locale.set
$locale.set = (newLocale: string): void | Promise<void> => {
  if (getAvailableLocale(newLocale) && hasLocaleQueue(newLocale)) {
    return flushQueue(newLocale).then(() => localeSet(newLocale))
  }
  return localeSet(newLocale)
}

$locale.update = (fn: (locale: string) => void | Promise<void>) =>
  localeSet(fn(current))

export { $locale, flushQueue, getCurrentLocale }
