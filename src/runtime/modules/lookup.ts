import { getMessageFromDictionary } from '../stores/dictionary';
import { getPossibleLocales } from '../stores/locale';

export const lookupCache: {
  [locale: string]: {
    [messageId: string]: any;
  };
} = {};

const addToCache = (path: string, locale: string, message: string) => {
  if (!message) return message;
  if (!(locale in lookupCache)) lookupCache[locale] = {};
  if (!(path in lookupCache[locale])) lookupCache[locale][path] = message;

  return message;
};

export const lookup = (path: string, refLocale: string | null | undefined) => {
  if (refLocale == null) return undefined;

  if (refLocale in lookupCache && path in lookupCache[refLocale]) {
    return lookupCache[refLocale][path];
  }

  const locales = getPossibleLocales(refLocale);

  for (let i = 0; i < locales.length; i++) {
    const locale = locales[i];
    const message = getMessageFromDictionary(locale, path);

    if (message) {
      // Used the requested locale as the cache key
      // Ex: { en: { title: "Title" }}
      // lookup('title', 'en-GB') should cache with 'en-GB' instead of 'en'
      return addToCache(path, refLocale, message);
    }
  }

  return undefined;
};
