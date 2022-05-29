import { setContext, getContext, hasContext, onDestroy } from 'svelte';

import { applyOptions, getOptions } from './configs';
import { $isLoading, createLoadingStore } from './stores/loading';
import { $locale, createLocaleStore } from './stores/locale';
import {
  $format,
  $formatDate,
  $formatNumber,
  $formatTime,
  $getJSON,
  createFormattingStores,
} from './stores/formatters';

import type { Writable, Readable } from 'svelte/store';
import type {
  MessageFormatter,
  TimeFormatter,
  DateFormatter,
  NumberFormatter,
  JSONGetter,
  ConfigureOptionsInit,
} from './types';

export type I18nClient = {
  locale: Writable<string | null | undefined>;
  isLoading: Readable<boolean>;
  format: Readable<MessageFormatter>;
  t: Readable<MessageFormatter>;
  _: Readable<MessageFormatter>;
  time: Readable<TimeFormatter>;
  date: Readable<DateFormatter>;
  number: Readable<NumberFormatter>;
  json: Readable<JSONGetter>;
};

export function createI18nClient(opts?: ConfigureOptionsInit): I18nClient {
  const isLoading = createLoadingStore();

  const options = { ...getOptions() };
  const initialLocale = applyOptions(opts, options);

  const { localeStore } = createLocaleStore(isLoading, options);

  localeStore.set(initialLocale);

  const { format, formatTime, formatDate, formatNumber, getJSON } =
    createFormattingStores(localeStore, () => options);

  return {
    locale: localeStore,
    isLoading,
    format,
    t: format,
    _: format,
    time: formatTime,
    date: formatDate,
    number: formatNumber,
    json: getJSON,
  };
}

const globalClient: I18nClient = {
  locale: $locale,
  isLoading: $isLoading,
  format: $format,
  t: $format,
  _: $format,
  time: $formatTime,
  date: $formatDate,
  number: $formatNumber,
  json: $getJSON,
};

const key = {};

const lifecycleFuncsStyle = { hasContext, setContext, getContext, onDestroy };
let lifecycleFuncs: typeof lifecycleFuncsStyle | null = null;

// Need the user to init it once, since we can't get the relevant functions by ourself by the way svelte compiling works.
// That is due to the fact that svelte is not a runtime dependency, rather just a code generator.
// It means for example that the svelte function "hasContext" is different between what this library sees,
//   and what the user uses.
export function initLifecycleFuncs(funcs: typeof lifecycleFuncsStyle) {
  lifecycleFuncs = { ...funcs };
}

function verifyLifecycleFuncsInit() {
  if (!lifecycleFuncs) {
    throw "Error: Lifecycle functions aren't initialized! Use initLifecycleFuncs() before.";
  }
}

type ClientContainer = { client: I18nClient | null };

// All the functions below can be called only in Svelte component initialization.

export function setI18nClientInContext(
  i18nClient: I18nClient,
): ClientContainer {
  verifyLifecycleFuncsInit();

  const clientContainer = { client: i18nClient };

  lifecycleFuncs!.setContext(key, clientContainer);

  return clientContainer;
}

export function clearI18nClientInContext(clientContainer: ClientContainer) {
  clientContainer.client = null;
}

// A shortcut function that initializes i18n client in context on component initialization
//    and cleans it on component destruction.
export function setupI18nClientInComponentInit(
  opts?: ConfigureOptionsInit,
): I18nClient {
  verifyLifecycleFuncsInit();

  const client = createI18nClient(opts);
  const container = setI18nClientInContext(client);

  // We clean the client from the context for robustness.
  //  Should svelte clean it by itself?
  //  Anyway it seems safer, because of the ability of the user to give custom lifecycle funcs.
  lifecycleFuncs!.onDestroy(() => clearI18nClientInContext(container));

  return client;
}

export function getI18nClientInComponentInit(): I18nClient {
  // Notice that unlike previous functions, calling this one without initializing lifecycle function is fine.
  // In this case, the global client will be returned.

  if (lifecycleFuncs?.hasContext(key)) {
    const { client } = lifecycleFuncs!.getContext<ClientContainer>(key);

    if (client !== null) {
      return client;
    }
  }
  // otherwise

  return globalClient;
}
