import { writable } from 'svelte/store';

import { flush, hasLocaleQueue } from '../includes/loaderQueue';
import { getOptions } from '../configs';
import { getClosestAvailableLocale } from './dictionary';
import { $isLoading } from './loading';

type LocaleStoreValue = string | null | undefined;
let current: LocaleStoreValue;
const internalLocale = writable<LocaleStoreValue>(null);

function getSubLocales(refLocale: string) {
  return refLocale
    .split('-')
    .map((_, i, arr) => arr.slice(0, i + 1).join('-'))
    .reverse();
}

export function getPossibleLocales(
  referenceLocales: string | string[],
  fallbackLocale = getOptions().fallbackLocale,
): string[] {
  const allSubLocales = Array.isArray(referenceLocales)
    ? referenceLocales.flatMap((locale) => getSubLocales(locale))
    : getSubLocales(referenceLocales);

  if (fallbackLocale) {
    return [...new Set([...allSubLocales, ...getSubLocales(fallbackLocale)])];
  }

  return allSubLocales;
}

export function getCurrentLocale() {
  return current ?? undefined;
}

internalLocale.subscribe((newLocale: LocaleStoreValue) => {
  current = newLocale ?? undefined;

  if (typeof window !== 'undefined' && newLocale != null) {
    document.documentElement.setAttribute('lang', newLocale);
  }
});

/**
 * Sets the current locale and loads any pending messages
 * for the specified locale.
 *
 * If an array of locales is passed, the first locale available
 * in the dictionary will be used.
 *
 * Note: for a locale to be available, it must have been loaded
 * or registered via (`addMessages` or `register`).
 */
const set = (
  newLocale: string | string[] | null | undefined,
): Promise<void> => {
  const availableLocale = Array.isArray(newLocale)
    ? /**
       * if an array was passed, get the closest available locale
       * i.e if the dictionary has 'en', 'de' and 'es' and the user requests
       * 'it' and 'es', 'es' will be used
       */
      getClosestAvailableLocale(newLocale)
    : newLocale;

  if (!hasLocaleQueue(availableLocale)) {
    internalLocale.set(availableLocale);

    return Promise.resolve();
  }

  const { loadingDelay } = getOptions();

  let loadingTimer: number;

  // if there's no current locale, we don't wait to set isLoading to true
  // because it would break pages when loading the initial locale
  if (
    typeof window !== 'undefined' &&
    getCurrentLocale() != null &&
    loadingDelay
  ) {
    loadingTimer = window.setTimeout(() => {
      $isLoading.set(true);
    }, loadingDelay);
  } else {
    $isLoading.set(true);
  }

  return flush(newLocale as string)
    .then(() => {
      internalLocale.set(availableLocale);
    })
    .finally(() => {
      clearTimeout(loadingTimer);
      $isLoading.set(false);
    });
};

const $locale = {
  subscribe: internalLocale.subscribe,
  update: (
    fn: (value: LocaleStoreValue) => string | string[] | null | undefined,
  ) => {
    return set(fn(getCurrentLocale()));
  },
  set,
};

export { $locale };
