import type { ConfigureOptions, ConfigureOptionsInit } from './types';
import { $locale } from './stores/locale';

interface Formats {
  number: Record<string, any>;
  date: Record<string, any>;
  time: Record<string, any>;
}

export const defaultFormats: Formats = {
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

export const defaultOptions: ConfigureOptions = {
  fallbackLocale: null,
  initialLocale: null,
  loadingDelay: 200,
  formats: defaultFormats,
  warnOnMissingMessages: true,
  ignoreTag: true,
};

const options: ConfigureOptions = defaultOptions as any;

export function getOptions() {
  return options;
}

export function init(opts: ConfigureOptionsInit) {
  const { formats, ...rest } = opts;
  const initialLocale = opts.initialLocale || opts.fallbackLocale;

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

  return $locale.set(initialLocale);
}
