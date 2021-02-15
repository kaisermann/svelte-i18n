import { derived } from 'svelte/store';

import type {
  MessageFormatter,
  MessageObject,
  TimeFormatter,
  DateFormatter,
  NumberFormatter,
  JSONGetter,
} from '../types';
import { lookup } from '../includes/lookup';
import { hasLocaleQueue } from '../includes/loaderQueue';
import {
  getMessageFormatter,
  getTimeFormatter,
  getDateFormatter,
  getNumberFormatter,
} from '../includes/formatters';
import { getOptions } from '../configs';
import { $dictionary } from './dictionary';
import { getCurrentLocale, getRelatedLocalesOf, $locale } from './locale';

const formatMessage: MessageFormatter = (id, options = {}) => {
  if (typeof id === 'object') {
    options = id as MessageObject;
    id = options.id;
  }

  const {
    values,
    locale = getCurrentLocale(),
    default: defaultValue,
  } = options;

  if (locale == null) {
    throw new Error(
      '[svelte-i18n] Cannot format a message without first setting the initial locale.',
    );
  }

  let message = lookup(id, locale);

  if (!message) {
    if (getOptions().warnOnMissingMessages) {
      // istanbul ignore next
      console.warn(
        `[svelte-i18n] The message "${id}" was not found in "${getRelatedLocalesOf(
          locale,
        ).join('", "')}".${
          hasLocaleQueue(getCurrentLocale())
            ? `\n\nNote: there are at least one loader still registered to this locale that wasn't executed.`
            : ''
        }`,
      );
    }

    message = defaultValue || id;
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
    result = getMessageFormatter(message, locale).format(values) as string;
  } catch (e) {
    console.warn(
      `[svelte-i18n] Message with "${id}" has syntax error:`,
      e.message,
    );
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

const getJSON: JSONGetter = <T = any>(id: string, locale = getCurrentLocale()) => {
  return lookup(id, locale) as T;
};

export const $format = derived([$locale, $dictionary], () => formatMessage);
export const $formatTime = derived([$locale], () => formatTime);
export const $formatDate = derived([$locale], () => formatDate);
export const $formatNumber = derived([$locale], () => formatNumber);
export const $getJSON = derived([$locale, $dictionary], () => getJSON);
