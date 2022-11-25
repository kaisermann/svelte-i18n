import { getCurrentLocale, $locale } from './stores/locale';
import { getOptions, init } from './configs';
import { flush, registerLocaleLoader } from './modules/loaderQueue';
import {
  getLocaleFromHostname,
  getLocaleFromPathname,
  getLocaleFromNavigator,
  getLocaleFromQueryString,
  getLocaleFromHash,
} from './modules/localeGetters';
import { $dictionary, $locales, addMessages } from './stores/dictionary';
import { $isLoading } from './stores/loading';
import {
  $format,
  $formatDate,
  $formatNumber,
  $formatTime,
  $getJSON,
} from './stores/formatters';
import {
  getDateFormatter,
  getNumberFormatter,
  getTimeFormatter,
  getMessageFormatter,
} from './modules/formatters';
import { unwrapFunctionStore } from './modules/unwrapFunctionStore';

import type { MessageObject } from './types/index';

// defineMessages allow us to define and extract dynamic message ids
export function defineMessages(i: Record<string, MessageObject>) {
  return i;
}

export function waitLocale(locale?: string) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/prefer-nullish-coalescing
  return flush(locale || getCurrentLocale() || getOptions().initialLocale!);
}

export {
  // setup
  init,
  addMessages,
  registerLocaleLoader as register,
  // stores
  $locale as locale,
  $dictionary as dictionary,
  $locales as locales,
  $isLoading as isLoading,
  // reactive methods
  $format as format,
  $format as _,
  $format as t,
  $formatDate as date,
  $formatNumber as number,
  $formatTime as time,
  $getJSON as json,
  // low-level
  getDateFormatter,
  getNumberFormatter,
  getTimeFormatter,
  getMessageFormatter,
  // utils
  unwrapFunctionStore,
  getLocaleFromHostname,
  getLocaleFromPathname,
  getLocaleFromNavigator,
  getLocaleFromQueryString,
  getLocaleFromHash,
};
