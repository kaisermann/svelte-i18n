import {
  hasLocaleDictionary,
  $dictionary,
  addMessages,
} from '../stores/dictionary';
import { getPossibleLocales } from '../stores/locale';

import type { MessagesLoader } from '../types';

type Queue = Set<MessagesLoader>;
const queue: Record<string, Queue> = {};

export function resetQueues() {
  Object.keys(queue).forEach((key) => {
    delete queue[key];
  });
}

function createLocaleQueue(locale: string) {
  queue[locale] = new Set();
}

function removeLoaderFromQueue(locale: string, loader: MessagesLoader) {
  queue[locale].delete(loader);

  if (queue[locale].size === 0) {
    delete queue[locale];
  }
}

function getLocaleQueue(locale: string) {
  return queue[locale];
}

function getLocalesQueues(locale: string) {
  return getPossibleLocales(locale)
    .map<[string, MessagesLoader[]]>((localeItem) => {
      const localeQueue = getLocaleQueue(localeItem);

      return [localeItem, localeQueue ? [...localeQueue] : []];
    })
    .filter(([, localeQueue]) => localeQueue.length > 0);
}

export function hasLocaleQueue(locale?: string | null) {
  if (locale == null) return false;

  return getPossibleLocales(locale).some(
    (localeQueue) => getLocaleQueue(localeQueue)?.size,
  );
}

function loadLocaleQueue(locale: string, localeQueue: MessagesLoader[]) {
  const allLoadersPromise = Promise.all(
    localeQueue.map((loader) => {
      // todo: maybe don't just remove, but add to a `loading` set?
      removeLoaderFromQueue(locale, loader);

      return loader().then((partial) => partial.default || partial);
    }),
  );

  return allLoadersPromise.then((partials) => addMessages(locale, ...partials));
}

const activeFlushes: { [key: string]: Promise<void> } = {};

export function flush(locale: string): Promise<void> {
  if (!hasLocaleQueue(locale)) {
    if (locale in activeFlushes) {
      return activeFlushes[locale];
    }

    return Promise.resolve();
  }

  // get queue of XX-YY and XX locales
  const queues = getLocalesQueues(locale);

  // todo: what happens if some loader fails?
  activeFlushes[locale] = Promise.all(
    queues.map(([localeName, localeQueue]) =>
      loadLocaleQueue(localeName, localeQueue),
    ),
  ).then(() => {
    if (hasLocaleQueue(locale)) {
      return flush(locale);
    }

    delete activeFlushes[locale];
  });

  return activeFlushes[locale];
}

export function registerLocaleLoader(locale: string, loader: MessagesLoader) {
  if (!getLocaleQueue(locale)) createLocaleQueue(locale);

  const localeQueue = getLocaleQueue(locale);

  // istanbul ignore if
  if (getLocaleQueue(locale).has(loader)) return;

  if (!hasLocaleDictionary(locale)) {
    $dictionary.update((d) => {
      d[locale] = {};

      return d;
    });
  }

  localeQueue.add(loader);
}
