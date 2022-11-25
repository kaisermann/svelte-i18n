import { writable } from 'svelte/store';

import { flush, hasLocaleQueue } from '../modules/loaderQueue';
import { getOptions } from '../configs';
import { getClosestAvailableLocale } from './dictionary';
import { $isLoading } from './loading';

let current: string | null | undefined;
const internalLocale = writable<string | null | undefined>(null);

function getSubLocales(refLocale: string) {
  return refLocale
    .split('-')
    .map((_, i, arr) => arr.slice(0, i + 1).join('-'))
    .reverse();
}

export function getPossibleLocales(
  refLocale: string,
  fallbackLocale = getOptions().fallbackLocale,
): string[] {
  const locales = getSubLocales(refLocale);

  if (fallbackLocale) {
    return [...new Set([...locales, ...getSubLocales(fallbackLocale)])];
  }

  return locales;
}

export function getCurrentLocale() {
  return current ?? undefined;
}

internalLocale.subscribe((newLocale: string | null | undefined) => {
  current = newLocale ?? undefined;

  if (typeof window !== 'undefined' && newLocale != null) {
    document.documentElement.setAttribute('lang', newLocale);
  }
});

const set = (newLocale: string | null | undefined): void | Promise<void> => {
  if (
    newLocale &&
    getClosestAvailableLocale(newLocale) &&
    hasLocaleQueue(newLocale)
  ) {
    const { loadingDelay } = getOptions();

    let loadingTimer: number;

    // if there's no current locale, we don't wait to set isLoading to true
    // because it would break pages when loading the initial locale
    if (
      typeof window !== 'undefined' &&
      getCurrentLocale() != null &&
      loadingDelay
    ) {
      loadingTimer = window.setTimeout(
        () => $isLoading.set(true),
        loadingDelay,
      );
    } else {
      $isLoading.set(true);
    }

    return flush(newLocale as string)
      .then(() => {
        internalLocale.set(newLocale);
      })
      .finally(() => {
        clearTimeout(loadingTimer);
        $isLoading.set(false);
      });
  }

  return internalLocale.set(newLocale);
};

const $locale = {
  ...internalLocale,
  set,
};

export { $locale };
