import { IntlMessageFormat } from 'intl-messageformat';

import { getCurrentLocale } from '../stores/locale';
import { getOptions } from '../configs';
import { monadicMemoize } from './memoize';

import type {
  MemoizedIntlFormatter,
  MemoizedIntlFormatterOptional,
} from '../types';

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
): any => {
  const { formats } = getOptions();

  if (type in formats && name in formats[type]) {
    return formats[type][name];
  }

  throw new Error(`[svelte-i18n] Unknown "${name}" ${type} format.`);
};

const createNumberFormatter: MemoizedNumberFormatterFactory = monadicMemoize(
  ({ locale, format, ...options }) => {
    if (locale == null) {
      throw new Error('[svelte-i18n] A "locale" must be set to format numbers');
    }

    if (format) {
      options = getIntlFormatterOptions('number', format);
    }

    return new Intl.NumberFormat(locale, options);
  },
);

const createDateFormatter: MemoizedDateTimeFormatterFactory = monadicMemoize(
  ({ locale, format, ...options }) => {
    if (locale == null) {
      throw new Error('[svelte-i18n] A "locale" must be set to format dates');
    }

    if (format) {
      options = getIntlFormatterOptions('date', format);
    } else if (Object.keys(options).length === 0) {
      options = getIntlFormatterOptions('date', 'short');
    }

    return new Intl.DateTimeFormat(locale, options);
  },
);

const createTimeFormatter: MemoizedDateTimeFormatterFactory = monadicMemoize(
  ({ locale, format, ...options }) => {
    if (locale == null) {
      throw new Error(
        '[svelte-i18n] A "locale" must be set to format time values',
      );
    }

    if (format) {
      options = getIntlFormatterOptions('time', format);
    } else if (Object.keys(options).length === 0) {
      options = getIntlFormatterOptions('time', 'short');
    }

    return new Intl.DateTimeFormat(locale, options);
  },
);

export const getNumberFormatter: MemoizedNumberFormatterFactoryOptional = ({
  locale = getCurrentLocale(),
  ...args
} = {}) => createNumberFormatter({ locale, ...args });

export const getDateFormatter: MemoizedDateTimeFormatterFactoryOptional = ({
  locale = getCurrentLocale(),
  ...args
} = {}) => createDateFormatter({ locale, ...args });

export const getTimeFormatter: MemoizedDateTimeFormatterFactoryOptional = ({
  locale = getCurrentLocale(),
  ...args
} = {}) => createTimeFormatter({ locale, ...args });

export const getMessageFormatter = monadicMemoize(
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  (message: string, locale: string = getCurrentLocale()!) =>
    new IntlMessageFormat(message, locale, getOptions().formats, {
      ignoreTag: getOptions().ignoreTag,
    }),
);
