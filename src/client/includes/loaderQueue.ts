import { MessagesLoader } from '../types'
import {
  hasLocaleDictionary,
  $dictionary,
  addMessages,
} from '../stores/dictionary'
import { getCurrentLocale, getFallbacksOf } from '../stores/locale'
import { $isLoading } from '../stores/loading'

type Queue = Set<MessagesLoader>
const loaderQueue: Record<string, Queue> = {}

function createLocaleQueue(locale: string) {
  loaderQueue[locale] = new Set()
}

function removeLocaleFromQueue(locale: string) {
  delete loaderQueue[locale]
}

function getLocaleQueue(locale: string) {
  return loaderQueue[locale]
}

function getLocalesQueues(locale: string) {
  return getFallbacksOf(locale)
    .reverse()
    .map<[string, MessagesLoader[]]>(localeItem => {
      const queue = getLocaleQueue(localeItem)
      return [localeItem, queue ? [...queue] : []]
    })
    .filter(([, queue]) => queue.length > 0)
}

export function hasLocaleQueue(locale: string) {
  return getFallbacksOf(locale)
    .reverse()
    .some(getLocaleQueue)
}

export function addLoaderToQueue(locale: string, loader: MessagesLoader) {
  loaderQueue[locale].add(loader)
}

const activeLocaleFlushes: { [key: string]: Promise<void> } = {}
export async function flushQueue(locale: string = getCurrentLocale()) {
  if (!hasLocaleQueue(locale)) return
  if (activeLocaleFlushes[locale]) return activeLocaleFlushes[locale]

  // get queue of XX-YY and XX locales
  const queues = getLocalesQueues(locale)
  if (queues.length === 0) return

  removeLocaleFromQueue(locale)
  const loadingDelay = setTimeout(() => $isLoading.set(true), 200)

  // TODO what happens if some loader fails
  activeLocaleFlushes[locale] = Promise.all(
    queues.map(([locale, queue]) => {
      return Promise.all(queue.map(loader => loader())).then(partials => {
        partials = partials.map(partial => partial.default || partial)
        addMessages(locale, ...partials)
      })
    })
  ).then(() => {
    clearTimeout(loadingDelay)
    $isLoading.set(false)
    delete activeLocaleFlushes[locale]
  })

  return activeLocaleFlushes[locale]
}

export function registerLocaleLoader(locale: string, loader: MessagesLoader) {
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
