import { MessagesLoader } from '../types'
import {
  hasLocaleDictionary,
  $dictionary,
  addMessages,
} from '../stores/dictionary'
import { getRelatedLocalesOf } from '../stores/locale'

type Queue = Set<MessagesLoader>
const queue: Record<string, Queue> = {}

export function resetQueues() {
  Object.keys(queue).forEach(key => {
    delete queue[key]
  })
}

function createLocaleQueue(locale: string) {
  queue[locale] = new Set()
}

function removeLoaderFromQueue(locale: string, loader: MessagesLoader) {
  queue[locale].delete(loader)

  if (queue[locale].size === 0) {
    delete queue[locale]
  }
}

function getLocaleQueue(locale: string) {
  return queue[locale]
}

function getLocalesQueues(locale: string) {
  return getRelatedLocalesOf(locale)
    .reverse()
    .map<[string, MessagesLoader[]]>(localeItem => {
      const queue = getLocaleQueue(localeItem)
      return [localeItem, queue ? [...queue] : []]
    })
    .filter(([, queue]) => queue.length > 0)
}

export function hasLocaleQueue(locale: string) {
  return getRelatedLocalesOf(locale)
    .reverse()
    .some(locale => getLocaleQueue(locale)?.size)
}

function loadLocaleQueue(locale: string, queue: MessagesLoader[]) {
  const allLoadersPromise = Promise.all(
    queue.map(loader => {
      // todo: maybe don't just remove, but add to a `loading` set?
      removeLoaderFromQueue(locale, loader)

      return loader().then(partial => partial.default || partial)
    })
  )

  return allLoadersPromise.then(partials => addMessages(locale, ...partials))
}

const activeFlushes: { [key: string]: Promise<void> } = {}
export function flush(locale: string): Promise<void> {
  if (!hasLocaleQueue(locale)) {
    if (locale in activeFlushes) {
      return activeFlushes[locale]
    }
    return
  }

  // get queue of XX-YY and XX locales
  const queues = getLocalesQueues(locale)

  // todo: what happens if some loader fails?
  activeFlushes[locale] = Promise.all(
    queues.map(([locale, queue]) => loadLocaleQueue(locale, queue))
  ).then(() => {
    if (hasLocaleQueue(locale)) {
      return flush(locale)
    }

    delete activeFlushes[locale]
  })

  return activeFlushes[locale]
}

export function registerLocaleLoader(locale: string, loader: MessagesLoader) {
  if (!getLocaleQueue(locale)) createLocaleQueue(locale)

  const queue = getLocaleQueue(locale)
  // istanbul ignore if
  if (getLocaleQueue(locale).has(loader)) return

  if (!hasLocaleDictionary(locale)) {
    $dictionary.update(d => {
      d[locale] = {}
      return d
    })
  }

  queue.add(loader)
}
