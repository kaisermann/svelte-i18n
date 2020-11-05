import { writable, derived } from 'svelte/store';
import deepmerge from 'deepmerge';
import dlv from 'dlv';

import { LocaleDictionary, LocalesDictionary } from '../types/index';
import { getFallbackOf } from './locale';

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

  const match = dlv(localeDictionary, id);

  return match;
}

export function getClosestAvailableLocale(locale: string): string | null {
  if (locale == null || hasLocaleDictionary(locale)) return locale;

  return getClosestAvailableLocale(getFallbackOf(locale));
}

export function addMessages(locale: string, ...partials: LocaleDictionary[]) {
  $dictionary.update((d) => {
    d[locale] = deepmerge.all<LocaleDictionary>([d[locale] || {}, ...partials]);

    return d;
  });
}

// eslint-disable-next-line no-shadow
const $locales = derived([$dictionary], ([dictionary]) =>
  Object.keys(dictionary),
);

$dictionary.subscribe((newDictionary) => (dictionary = newDictionary));

export { $dictionary, $locales };
