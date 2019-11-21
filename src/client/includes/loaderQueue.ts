import merge from 'deepmerge'

import { LocaleLoader } from '../types'
import {
  hasLocaleDictionary,
  $dictionary,
  addMessagesTo,
} from '../stores/dictionary'
import { getCurrentLocale } from '../stores/locale'
import { $loading } from '../stores/loading'

import { removeFromLookupCache } from './lookup'
import { getLocalesFrom } from './utils'

const loaderQueue: Record<string, Set<LocaleLoader>> = {}

function createLocaleQueue(locale: string) {
  loaderQueue[locale] = new Set()
}

function removeLocaleFromQueue(locale: string) {
  delete loaderQueue[locale]
}

function getLocaleQueue(locale: string) {
  return loaderQueue[locale]
}

function getLocalesQueue(locale: string) {
  return getLocalesFrom(locale)
    .reverse()
    .reduce(
      (acc, localeItem) =>
        getLocaleQueue(localeItem)
          ? acc.concat([...getLocaleQueue(localeItem)])
          : acc,
      []
    )
}

export function hasLocaleQueue(locale: string) {
  return getLocalesFrom(locale)
    .reverse()
    .some(getLocaleQueue)
}

export function addLoaderToQueue(locale: string, loader: LocaleLoader) {
  loaderQueue[locale].add(loader)
}

export async function flushQueue(locale: string = getCurrentLocale()) {
  if (!hasLocaleQueue(locale)) return

  // get queue of XX-YY and XX locales
  const queue = getLocalesQueue(locale)
  if (queue.length === 0) return

  removeLocaleFromQueue(locale)
  const loadingDelay = setTimeout(() => $loading.set(true), 200)

  // todo what happens if some loader fails?
  return Promise.all(queue.map(loader => loader()))
    .then(partials => {
      partials = partials.map(partial => partial.default || partial)

      removeFromLookupCache(locale)
      addMessagesTo(locale, ...partials)
    })
    .then(() => {
      clearTimeout(loadingDelay)
      $loading.set(false)
    })
}

export function registerLocaleLoader(locale: string, loader: LocaleLoader) {
  if (!getLocaleQueue(locale)) createLocaleQueue(locale)

  const queue = getLocaleQueue(locale)
  if (getLocaleQueue(locale).has(loader)) return

  if (!hasLocaleDictionary(locale)) {
    $dictionary.update(d => {
      d[locale] = {}
      return d
    })
  }

  queue.add(loader)
}
