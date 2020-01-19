'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var icuHelpers = require('icu-helpers');
var store = require('svelte/store');

// import { writable } from 'svelte/store'
// import { flush, hasLocaleQueue } from '../includes/loaderQueue'
// import { getOptions } from '../configs'
// import { getClosestAvailableLocale } from './dictionary'
// let current: string
// const $locale = writable(null)
// export function isFallbackLocaleOf(localeA: string, localeB: string) {
//   return localeB.indexOf(localeA) === 0 && localeA !== localeB
// }
// export function isRelatedLocale(localeA: string, localeB: string) {
//   return (
//     localeA === localeB ||
//     isFallbackLocaleOf(localeA, localeB) ||
//     isFallbackLocaleOf(localeB, localeA)
//   )
// }
// export function getFallbackOf(locale: string) {
//   const index = locale.lastIndexOf('-')
//   if (index > 0) return locale.slice(0, index)
//   const { fallbackLocale } = getOptions()
//   if (fallbackLocale && !isRelatedLocale(locale, fallbackLocale)) {
//     return fallbackLocale
//   }
//   return null
// }
// export function getRelatedLocalesOf(locale: string): string[] {
//   const locales = locale
//     .split('-')
//     .map((_, i, arr) => arr.slice(0, i + 1).join('-'))
//   const { fallbackLocale } = getOptions()
//   if (fallbackLocale && !isRelatedLocale(locale, fallbackLocale)) {
//     return locales.concat(getRelatedLocalesOf(fallbackLocale))
//   }
//   return locales
// }
// export function getCurrentLocale() {
//   return current
// }
icuHelpers.currentLocale.subscribe((newLocale) => {
    // current = newLocale
    if (typeof window !== 'undefined') {
        document.documentElement.setAttribute('lang', newLocale);
    }
});

// could use a reduce, but a simple for-in has less footprint
const flatObj = (obj, prefix = '') => {
    const flatted = {};
    for (const key in obj) {
        const flatKey = prefix + key;
        // we want plain objects and arrays
        if (typeof obj[key] === 'object') {
            Object.assign(flatted, flatObj(obj[key], `${flatKey}.`));
        }
        else {
            flatted[flatKey] = obj[key];
        }
    }
    return flatted;
};

// import { getFallbackOf } from './locale'
// let dictionary: Dictionary
// const $dictionary = writable<Dictionary>({})
// export function getLocaleDictionary(locale: string) {
//   return (dictionary[locale] as LocaleDictionary) || null
// }
// export function getDictionary() {
//   return dictionary
// }
// export function hasLocaleDictionary(locale: string) {
//   return locale in dictionary
// }
// export function getMessageFromDictionary(locale: string, id: string) {
//   if (hasLocaleDictionary(locale)) {
//     const localeDictionary = getLocaleDictionary(locale)
//     if (id in localeDictionary) {
//       return localeDictionary[id]
//     }
//   }
//   return null
// }
// export function getClosestAvailableLocale(locale: string): string | null {
//   if (locale == null || hasLocaleDictionary(locale)) return locale
//   return getClosestAvailableLocale(getFallbackOf(locale))
// }
// export function addMessages(locale: string, ...partials: DeepDictionary[]) {
//   const flattedPartials = partials.map(partial => flatObj(partial))
//   $dictionary.update(d => {
//     d[locale] = Object.assign(d[locale] || {}, ...flattedPartials)
//     return d
//   })
// }
// const $locales = derived([$dictionary], ([$dictionary]) =>
//   Object.keys($dictionary)
// )
// $dictionary.subscribe(newDictionary => (dictionary = newDictionary))
// export { $dictionary, $locales }
function addMessages(locale, partials) {
    const flattedPartials = flatObj(partials);
    icuHelpers.addMessages(locale, flattedPartials);
}

const formatMessage = (id, options = {}) => {
    const message = icuHelpers.lookupMessage(id);
    if (typeof message === 'string') {
        return message;
    }
    else {
        return message(...Object.keys(options.values).sort().map(k => options.values[k]));
    }
    // if (typeof id === 'object') {
    //   options = id as MessageObject
    //   id = options.id
    // }
    // const { values, locale = getCurrentLocale(), default: defaultValue } = options
    // if (locale == null) {
    //   throw new Error(
    //     '[svelte-i18n] Cannot format a message without first setting the initial locale.'
    //   )
    // }
    // const message = lookup(id, locale)
    // if (!message) {
    //   if (getOptions().warnOnMissingMessages) {
    //     // istanbul ignore next
    //     console.warn(
    //       `[svelte-i18n] The message "${id}" was not found in "${getRelatedLocalesOf(
    //         locale
    //       ).join('", "')}".${
    //         hasLocaleQueue(getCurrentLocale())
    //           ? `\n\nNote: there are at least one loader still registered to this locale that wasn't executed.`
    //           : ''
    //       }`
    //     )
    //   }
    //   return defaultValue || id
    // }
    // if (!values) return message
    // return getMessageFormatter(message, locale).format(values)
};
// export const $format = derived([$locale, $dictionary], () => formatMessage)
const $formatTime = store.derived([icuHelpers.currentLocale], () => icuHelpers.formatTime);
const $formatDate = store.derived([icuHelpers.currentLocale], () => icuHelpers.formatDate);
const $formatNumber = store.derived([icuHelpers.currentLocale], () => icuHelpers.formatNumber);
const $format = store.derived([icuHelpers.currentLocale, icuHelpers.dictionary], () => formatMessage);

Object.defineProperty(exports, 'dictionary', {
  enumerable: true,
  get: function () {
    return icuHelpers.dictionary;
  }
});
Object.defineProperty(exports, 'getDateFormatter', {
  enumerable: true,
  get: function () {
    return icuHelpers.getDateFormatter;
  }
});
Object.defineProperty(exports, 'getNumberFormatter', {
  enumerable: true,
  get: function () {
    return icuHelpers.getNumberFormatter;
  }
});
Object.defineProperty(exports, 'getTimeFormatter', {
  enumerable: true,
  get: function () {
    return icuHelpers.getTimeFormatter;
  }
});
Object.defineProperty(exports, 'init', {
  enumerable: true,
  get: function () {
    return icuHelpers.init;
  }
});
Object.defineProperty(exports, 'locale', {
  enumerable: true,
  get: function () {
    return icuHelpers.currentLocale;
  }
});
Object.defineProperty(exports, 'locales', {
  enumerable: true,
  get: function () {
    return icuHelpers.locales;
  }
});
exports._ = $format;
exports.addMessages = addMessages;
exports.format = $format;
exports.formatDate = $formatDate;
exports.formatNumber = $formatNumber;
exports.formatTime = $formatTime;
exports.t = $format;
