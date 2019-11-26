import { writable } from 'svelte/store'

import { flushQueue, hasLocaleQueue } from '../includes/loaderQueue'
import { getClientLocale } from '../includes/utils'
import { GetClientLocaleOptions } from '../types'

import { getClosestAvailableLocale } from './dictionary'
import { setFallbackLocale, getFallbackLocale } from '../configs'

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
  if (getFallbackLocale() && !isRelatedLocale(locale, getFallbackLocale())) {
    return getFallbackLocale()
  }
  return null
}

export function getRelatedLocalesOf(locale: string): string[] {
  const locales = locale
    .split('-')
    .map((_, i, arr) => arr.slice(0, i + 1).join('-'))

  if (getFallbackLocale() && !isRelatedLocale(locale, getFallbackLocale())) {
    return locales.concat(getRelatedLocalesOf(getFallbackLocale()))
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
    return flushQueue(newLocale).then(() => localeSet(newLocale))
  }
  return localeSet(newLocale)
}

$locale.update = (fn: (locale: string) => void | Promise<void>) =>
  localeSet(fn(current))

export { $locale }
