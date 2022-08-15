import { derived, Readable } from 'svelte/store';

import type {
  MessageFormatter,
  MessageFormatterExtended,
  MessageObject,
  TimeFormatter,
  DateFormatter,
  NumberFormatter,
  JSONGetter,
  ConfigureOptions,
} from '../types';
import { lookup } from '../includes/lookup';
import {
  getMessageFormatter,
  getTimeFormatter,
  getDateFormatter,
  getNumberFormatter,
} from '../includes/formatters';
import { getOptions } from '../configs';
import { $dictionary } from './dictionary';
import { getCurrentLocale, $locale } from './locale';
import type { Formats } from 'intl-messageformat';

const formatMessage: MessageFormatterExtended = (id, options, fallbackLocale, _options) => {
  let messageObj = options as MessageObject;

  if (typeof id === 'object') {
    messageObj = id as MessageObject;
    id = messageObj.id;
  }

  const {
    values,
    locale = fallbackLocale,
    default: defaultValue,
  } = messageObj;

  if (!locale) {
    throw new Error(
      '[svelte-i18n] Cannot format a message without first setting the initial locale.',
    );
  }

  let message = lookup(id, locale);

  if (!message) {
    message =
      _options.handleMissingMessage?.({ locale, id, defaultValue }) ??
      defaultValue ??
      id;
  } else if (typeof message !== 'string') {
    console.warn(
      `[svelte-i18n] Message with id "${id}" must be of type "string", found: "${typeof message}". Gettin its value through the "$format" method is deprecated; use the "json" method instead.`,
    );

    return message;
  }

  if (!values) {
    return message;
  }

  let result = message;

  try {
    result = getMessageFormatter(message, locale, _options).format(values) as string;
  } catch (e) {
    console.warn(`[svelte-i18n] Message "${id}" has syntax error:`, e.message);
  }

  return result;
};

const formatTime: TimeFormatter = (t, options) => {
  return getTimeFormatter(options).format(t);
};

const formatDate: DateFormatter = (d, options) => {
  return getDateFormatter(options).format(d);
};

const formatNumber: NumberFormatter = (n, options) => {
  return getNumberFormatter(options).format(n);
};

const getJSON: JSONGetter = <T = any>(
  id: string,
  locale = getCurrentLocale(),
) => {
  return lookup(id, locale) as T;
};

function putInOptions<T1, T2 extends { locale?: string, formats?: Formats }, S>(
  func: (first: T1, options?: T2) => S, _locale: string | undefined, _options: ConfigureOptions) :
  (first: T1, options?: T2) => S {
  return function (first, options) {
    options = { ...options } as T2;

    if (!options?.locale) {
      options.locale = _locale;
    }

    if (!options?.formats) {
      options.formats = _options.formats;
    }

    return func(first, options);
  };
}

const normalizeLocale = (locale: string | null | undefined) => locale ?? undefined;

export function createFormattingStores(localeStore: Readable<string | null | undefined>,
  getOptions: () => ConfigureOptions) {
  
  return {
    format: derived([localeStore, $dictionary], ([$locale, ]) => (id: any, options = {}) =>
      formatMessage(id, options, normalizeLocale($locale), getOptions())),
    formatTime: derived([localeStore], ([$locale, ]) => putInOptions(formatTime, normalizeLocale($locale), getOptions())),
    formatDate: derived([localeStore], ([$locale, ]) => putInOptions(formatDate, normalizeLocale($locale), getOptions())),
    formatNumber: derived([localeStore], ([$locale, ]) => putInOptions(formatNumber, normalizeLocale($locale), getOptions())),
    getJSON: derived([localeStore, $dictionary], ([$locale, ]) => <T = any>(id: string, locale: string | undefined) =>
      getJSON<T>(id, locale || normalizeLocale($locale))),
  };
}

const singletonStores = createFormattingStores($locale, getOptions);

export const $format: Readable<MessageFormatter> = singletonStores.format;
export const $formatTime: Readable<TimeFormatter> = singletonStores.formatTime;
export const $formatDate: Readable<DateFormatter> = singletonStores.formatDate;
export const $formatNumber: Readable<NumberFormatter> = singletonStores.formatNumber;
export const $getJSON: Readable<JSONGetter> = singletonStores.getJSON;