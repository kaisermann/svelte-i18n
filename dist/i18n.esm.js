import { currentLocale, addMessages as addMessages$1, lookupMessage } from 'icu-helpers';
export { dictionary, currentLocale as locale, locales } from 'icu-helpers';
import { derived } from 'svelte/store';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

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
const getFromQueryString = (queryString, key) => {
    const keyVal = queryString.split('&').find(i => i.indexOf(`${key}=`) === 0);
    if (keyVal) {
        return keyVal.split('=').pop();
    }
    return null;
};
const getFirstMatch = (base, pattern) => {
    const match = pattern.exec(base);
    // istanbul ignore if
    if (!match)
        return null;
    // istanbul ignore else
    return match[1] || null;
};
const getClientLocale = ({ navigator, hash, search, pathname, hostname, }) => {
    let locale;
    // istanbul ignore next
    if (typeof window === 'undefined')
        return null;
    if (hostname) {
        locale = getFirstMatch(window.location.hostname, hostname);
        if (locale)
            return locale;
    }
    if (pathname) {
        locale = getFirstMatch(window.location.pathname, pathname);
        if (locale)
            return locale;
    }
    if (navigator) {
        // istanbul ignore else
        locale = window.navigator.language || window.navigator.languages[0];
        if (locale)
            return locale;
    }
    if (search) {
        locale = getFromQueryString(window.location.search.substr(1), search);
        if (locale)
            return locale;
    }
    if (hash) {
        locale = getFromQueryString(window.location.hash.substr(1), hash);
        if (locale)
            return locale;
    }
    return null;
};

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
currentLocale.subscribe((newLocale) => {
    // current = newLocale
    if (typeof window !== 'undefined') {
        document.documentElement.setAttribute('lang', newLocale);
    }
});

const defaultFormats = {
    number: {
        scientific: { notation: 'scientific' },
        engineering: { notation: 'engineering' },
        compactLong: { notation: 'compact', compactDisplay: 'long' },
        compactShort: { notation: 'compact', compactDisplay: 'short' },
    },
    date: {
        short: { month: 'numeric', day: 'numeric', year: '2-digit' },
        medium: { month: 'short', day: 'numeric', year: 'numeric' },
        long: { month: 'long', day: 'numeric', year: 'numeric' },
        full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    },
    time: {
        short: { hour: 'numeric', minute: 'numeric' },
        medium: { hour: 'numeric', minute: 'numeric', second: 'numeric' },
        long: {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            timeZoneName: 'short',
        },
        full: {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            timeZoneName: 'short',
        },
    },
};
const defaultOptions = {
    fallbackLocale: null,
    initialLocale: null,
    loadingDelay: 200,
    formats: defaultFormats,
    warnOnMissingMessages: true,
};
const options = defaultOptions;
function init(opts) {
    const { formats } = opts, rest = __rest(opts, ["formats"]);
    const initialLocale = opts.initialLocale
        ? typeof opts.initialLocale === 'string'
            ? opts.initialLocale
            : getClientLocale(opts.initialLocale) || opts.fallbackLocale
        : opts.fallbackLocale;
    Object.assign(options, rest, { initialLocale });
    if (formats) {
        if ('number' in formats) {
            Object.assign(options.formats.number, formats.number);
        }
        if ('date' in formats) {
            Object.assign(options.formats.date, formats.date);
        }
        if ('time' in formats) {
            Object.assign(options.formats.time, formats.time);
        }
    }
    return currentLocale.set(initialLocale);
}

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
    addMessages$1(locale, flattedPartials);
}

const formatMessage = (id, options = {}) => {
    const message = lookupMessage(id);
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
// const formatTime: TimeFormatter = (t, options) =>
//   getTimeFormatter(options).format(t)
// const formatDate: DateFormatter = (d, options) =>
//   getDateFormatter(options).format(d)
// const formatNumber: NumberFormatter = (n, options) =>
//   getNumberFormatter(options).format(n)
// export const $format = derived([$locale, $dictionary], () => formatMessage)
// export const $formatTime = derived([$locale], () => formatTime)
// export const $formatDate = derived([$locale], () => formatDate)
// export const $formatNumber = derived([$locale], () => formatNumber)
const $format = derived([currentLocale /*, $dictionary*/], () => formatMessage);

export { $format as _, addMessages, $format as format, init, $format as t };
