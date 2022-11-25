import { writable, derived } from 'svelte/store';
import deepmerge from 'deepmerge';

import { getPossibleLocales } from './locale';
import { delve } from '../../shared/delve';
import { lookupCache } from '../modules/lookup';

import type { LocaleDictionary, LocalesDictionary } from '../types/index';

let dictionary: LocalesDictionary;
const $dictionary = writable<LocalesDictionary>({});

export function getLocaleDictionary(locale: string) {
  return (dictionary[locale] as LocaleDictionary) || null;
}

export function getDictionary() {
  return dictionary;
}

export function hasLocaleDictionary(locale: string) {
  return locale in dictionary;
}

export function getMessageFromDictionary(locale: string, id: string) {
  if (!hasLocaleDictionary(locale)) {
    return null;
  }

  const localeDictionary = getLocaleDictionary(locale);

  const match = delve(localeDictionary, id);

  return match;
}

export function getClosestAvailableLocale(
  refLocale: string | null | undefined,
): string | undefined {
  if (refLocale == null) return undefined;

  const relatedLocales = getPossibleLocales(refLocale);

  for (let i = 0; i < relatedLocales.length; i++) {
    const locale = relatedLocales[i];

    if (hasLocaleDictionary(locale)) {
      return locale;
    }
  }

  return undefined;
}

export function addMessages(locale: string, ...partials: LocaleDictionary[]) {
  delete lookupCache[locale];

  $dictionary.update((d) => {
    d[locale] = deepmerge.all<LocaleDictionary>([d[locale] || {}, ...partials]);

    return d;
  });
}

// eslint-disable-next-line @typescript-eslint/no-shadow
const $locales = derived([$dictionary], ([dictionary]) =>
  Object.keys(dictionary),
);

$dictionary.subscribe((newDictionary) => (dictionary = newDictionary));

export { $dictionary, $locales };
