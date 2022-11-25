import { derived } from 'svelte/store';

import { lookup } from '../modules/lookup';
import {
  getMessageFormatter,
  getTimeFormatter,
  getDateFormatter,
  getNumberFormatter,
} from '../modules/formatters';
import { getOptions } from '../configs';
import { $dictionary } from './dictionary';
import { getCurrentLocale, $locale } from './locale';

import type {
  MessageFormatter,
  MessageObject,
  TimeFormatter,
  DateFormatter,
  NumberFormatter,
  JSONGetter,
} from '../types';

const formatMessage: MessageFormatter = (id, options = {}) => {
  let messageObj = options as MessageObject;

  if (typeof id === 'object') {
    messageObj = id as MessageObject;
    id = messageObj.id;
  }

  const {
    values,
    locale = getCurrentLocale(),
    default: defaultValue,
  } = messageObj;

  if (locale == null) {
    throw new Error(
      '[svelte-i18n] Cannot format a message without first setting the initial locale.',
    );
  }

  let message = lookup(id, locale);

  if (!message) {
    message =
      getOptions().handleMissingMessage?.({ locale, id, defaultValue }) ??
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
    result = getMessageFormatter(message, locale).format(values) as string;
  } catch (e) {
    if (e instanceof Error) {
      console.warn(
        `[svelte-i18n] Message "${id}" has syntax error:`,
        e.message,
      );
    }
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

export const $format = derived([$locale, $dictionary], () => formatMessage);
export const $formatTime = derived([$locale], () => formatTime);
export const $formatDate = derived([$locale], () => formatDate);
export const $formatNumber = derived([$locale], () => formatNumber);
export const $getJSON = derived([$locale, $dictionary], () => getJSON);
