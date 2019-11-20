import merge from 'deepmerge'

import { LocaleLoader } from '../types'
import { hasLocaleDictionary, $dictionary } from '../stores/dictionary'
import { getCurrentLocale } from '../stores/locale'
import { $loading } from '../stores/loading'

import { removeFromLookupCache } from './lookup'

const loaderQueue: Record<string, Set<LocaleLoader>> = {}

function getLocaleQueue(locale: string) {
  return loaderQueue[locale]
}

function createLocaleQueue(locale: string) {
  loaderQueue[locale] = new Set()
}

function removeLocaleFromQueue(locale: string) {
  delete loaderQueue[locale]
}

export function addLoaderToQueue(locale: string, loader: LocaleLoader) {
  loaderQueue[locale].add(loader)
}

export async function flushQueue(locale: string = getCurrentLocale()) {
  if (!getLocaleQueue(locale)) return

  const queue = [...getLocaleQueue(locale)]

  if (queue.length === 0) return

  removeLocaleFromQueue(locale)
  $loading.set(true)

  // todo what happens if some loader fails?
  return Promise.all(queue.map(loader => loader()))
    .then(partials => {
      partials = partials.map(partial => partial.default || partial)

      removeFromLookupCache(locale)

      $dictionary.update(d => {
        d[locale] = merge.all<any>([d[locale] || {}].concat(partials))
        return d
      })
    })
    .then(() => $loading.set(false))
}

export function registerLocaleLoader(locale: string, loader: LocaleLoader) {
  if (!getLocaleQueue(locale)) createLocaleQueue(locale)

  const queue = getLocaleQueue(locale)
  if (queue.has(loader)) return

  if (!hasLocaleDictionary(locale)) {
    $dictionary.update(d => {
      d[locale] = {}
      return d
    })
  }

  queue.add(loader)
}
