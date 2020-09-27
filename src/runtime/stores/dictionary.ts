import { writable, derived } from 'svelte/store';

import { LocaleDictionary, DeepDictionary, Dictionary } from '../types/index';
import { flatObj } from '../includes/flatObj';
import { getFallbackOf } from './locale';

let dictionary: Dictionary;
const $dictionary = writable<Dictionary>({});

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
  if (hasLocaleDictionary(locale)) {
    const localeDictionary = getLocaleDictionary(locale);

    if (/^(\w+\.)+\w+$/.test(id)) {
      const keys = id.split('.');

      const value: Map<string, any> = new Map<string, any>();

      for (const [index, key] of keys.entries()) {
        if (index === 0) {
          value.set('message', localeDictionary[key]);
        } else {
          value.set('message', value.get('message')[key]);
        }
      }

      return value.get('message');
    }

    if (id in localeDictionary) {
      return localeDictionary[id];
    }
  }

  return null;
}

export function getClosestAvailableLocale(locale: string): string | null {
  if (locale == null || hasLocaleDictionary(locale)) return locale;

  return getClosestAvailableLocale(getFallbackOf(locale));
}

export function addMessages(locale: string, ...partials: DeepDictionary[]) {
  const flattedPartials = partials.map((partial) => flatObj(partial));

  $dictionary.update((d) => {
    const test = d[locale] !== undefined ? d[locale] : {};

    console.log(
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      test,
    );
    console.log(
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      d[locale] || {},
    );

    console.log(
      'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
      { ...test[locale], ...flattedPartials },
    );
    console.log(
      'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
      Object.assign(d[locale] || {}, ...flattedPartials),
    );

    d[locale] = Object.assign(d[locale] || {}, ...flattedPartials);
    console.log(
      'UPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
      d,
    );

    return d;
  });
}

// eslint-disable-next-line no-shadow
const $locales = derived([$dictionary], ([dictionary]) =>
  Object.keys(dictionary),
);

$dictionary.subscribe((newDictionary) => (dictionary = newDictionary));

export { $dictionary, $locales };
