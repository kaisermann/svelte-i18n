import type {
  ConfigureOptions,
  ConfigureOptionsInit,
  MissingKeyHandlerInput,
} from './types';
import { $locale, getCurrentLocale, getPossibleLocales } from './stores/locale';
import { hasLocaleQueue } from './includes/loaderQueue';

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

/**
 * Default missing key handler used in case "warnOnMissingMessages" is set to true.
 */
function defaultMissingKeyHandler({ locale, id }: MissingKeyHandlerInput) {
  // istanbul ignore next
  console.warn(
    `[svelte-i18n] The message "${id}" was not found in "${getPossibleLocales(
      locale,
    ).join('", "')}".${
      hasLocaleQueue(getCurrentLocale())
        ? `\n\nNote: there are at least one loader still registered to this locale that wasn't executed.`
        : ''
    }`,
  );
}

export const defaultOptions: ConfigureOptions = {
  fallbackLocale: null as any,
  loadingDelay: 200,
  formats: defaultFormats,
  warnOnMissingMessages: true,
  handleMissingMessage: undefined,
  ignoreTag: true,
};

// Deep copy to options
const options: ConfigureOptions = JSON.parse(JSON.stringify(defaultOptions)) as any;

export function getOptions() {
  return options;
}

export function applyOptions(opts: ConfigureOptionsInit | undefined, target: ConfigureOptions) {
  if (opts === undefined) {
    return undefined;
  }
  // otherwise

  const { formats, ...rest } = opts;
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const initialLocale = opts.initialLocale || opts.fallbackLocale;

  if (rest.warnOnMissingMessages) {
    delete rest.warnOnMissingMessages;

    if (rest.handleMissingMessage == null) {
      rest.handleMissingMessage = defaultMissingKeyHandler;
    } else {
      console.warn(
        '[svelte-i18n] The "warnOnMissingMessages" option is deprecated. Please use the "handleMissingMessage" option instead.',
      );
    }
  }

  Object.assign(target, rest, { initialLocale });

  if (formats) {
    if ('number' in formats) {
      Object.assign(target.formats.number, formats.number);
    }

    if ('date' in formats) {
      Object.assign(target.formats.date, formats.date);
    }

    if ('time' in formats) {
      Object.assign(target.formats.time, formats.time);
    }
  }

  return initialLocale;
}

export function init(opts: ConfigureOptionsInit) {
  const initialLocale = applyOptions(opts, getOptions());

  return $locale.set(initialLocale);
}