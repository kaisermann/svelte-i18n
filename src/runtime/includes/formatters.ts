import IntlMessageFormat, { Formats } from 'intl-messageformat';

import type {
  MemoizedIntlFormatter,
  MemoizedIntlFormatterOptional,
} from '../types';
import { getCurrentLocale } from '../stores/locale';
import { getOptions } from '../configs';
import { monadicMemoize } from './memoize';

type MemoizedNumberFormatterFactory = MemoizedIntlFormatter<
  Intl.NumberFormat,
  Intl.NumberFormatOptions
>;

type MemoizedDateTimeFormatterFactory = MemoizedIntlFormatter<
  Intl.DateTimeFormat,
  Intl.DateTimeFormatOptions
>;

type MemoizedNumberFormatterFactoryOptional = MemoizedIntlFormatterOptional<
  Intl.NumberFormat,
  Intl.NumberFormatOptions
>;

type MemoizedDateTimeFormatterFactoryOptional = MemoizedIntlFormatterOptional<
  Intl.DateTimeFormat,
  Intl.DateTimeFormatOptions
>;

const getIntlFormatterOptions = (
  type: 'time' | 'number' | 'date',
  name: string,
  formats: Formats,
): any => {
  if (type in formats && name in formats[type]) {
    return formats[type][name];
  }

  throw new Error(`[svelte-i18n] Unknown "${name}" ${type} format.`);
};

const createNumberFormatter: MemoizedNumberFormatterFactory = monadicMemoize(
  ({ locale, ...options }) => {
    if (!locale) {
      throw new Error('[svelte-i18n] A "locale" must be set to format numbers');
    }

    return new Intl.NumberFormat(locale, options);
  },
);

const createDateFormatter: MemoizedDateTimeFormatterFactory = monadicMemoize(
  ({ locale, ...options }) => {
    if (!locale) {
      throw new Error('[svelte-i18n] A "locale" must be set to format dates');
    }

    return new Intl.DateTimeFormat(locale, options);
  },
);

const createTimeFormatter: MemoizedDateTimeFormatterFactory = monadicMemoize(
  ({ locale, ...options }) => {
    if (!locale) {
      throw new Error(
        '[svelte-i18n] A "locale" must be set to format time values',
      );
    }

    return new Intl.DateTimeFormat(locale, options);
  },
);

const createMessageFormatter = monadicMemoize(
  (message: string, locale = getCurrentLocale(), formats = getOptions().formats,
    ignoreTag = getOptions().ignoreTag) => {
    return new IntlMessageFormat(message, locale, formats, {
      ignoreTag,
    })
  },
);

export const getNumberFormatter: MemoizedNumberFormatterFactoryOptional = ({
  locale = getCurrentLocale(),
  format = undefined as (string | undefined),
  formats = getOptions().formats,
  ...options
} = {}) => {
  if (format) {
    options = getIntlFormatterOptions('number', format, formats);
  }

  return createNumberFormatter({ locale, ...options });
}

export const getDateFormatter: MemoizedDateTimeFormatterFactoryOptional = ({
  locale = getCurrentLocale(),
  format = undefined as (string | undefined),
  formats = getOptions().formats,
  ...options
} = {}) => {
  if (format) {
    options = getIntlFormatterOptions('date', format, formats);
  } else if (Object.keys(options).length === 0) {
    options = getIntlFormatterOptions('date', 'short', formats);
  }

  return createDateFormatter({ locale, ...options });
}

export const getTimeFormatter: MemoizedDateTimeFormatterFactoryOptional = ({
  locale = getCurrentLocale(),
  format = undefined as (string | undefined),
  formats = getOptions().formats,
  ...options
} = {}) => {
  if (format) {
    options = getIntlFormatterOptions('time', format, formats);
  } else if (Object.keys(options).length === 0) {
    options = getIntlFormatterOptions('time', 'short', formats);
  }

  return createTimeFormatter({ locale, ...options });
}

export const getMessageFormatter = (message: string, locale: string = getCurrentLocale()!, options = getOptions()) =>
  createMessageFormatter(message, locale, options.formats, options.ignoreTag);
