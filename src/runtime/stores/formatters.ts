import { derived } from 'svelte/store';

import {
  MessageFormatter,
  MessageObject,
  TimeFormatter,
  DateFormatter,
  NumberFormatter,
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
  }

  if (!values) return message;

  return getMessageFormatter(message, locale).format(values) as string;
};

const formatTime: TimeFormatter = (t, options) =>
  getTimeFormatter(options).format(t);

const formatDate: DateFormatter = (d, options) =>
  getDateFormatter(options).format(d);

const formatNumber: NumberFormatter = (n, options) =>
  getNumberFormatter(options).format(n);

export const $format = derived([$locale, $dictionary], () => formatMessage);
export const $formatTime = derived([$locale], () => formatTime);
export const $formatDate = derived([$locale], () => formatDate);
export const $formatNumber = derived([$locale], () => formatNumber);
