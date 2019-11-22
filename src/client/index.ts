import merge from 'deepmerge'

import { GetClientLocaleOptions, MessageObject } from './types'
import { getClientLocale } from './includes/utils'
import { $locale } from './stores/locale'

// defineMessages allow us to define and extract dynamic message ids
export function defineMessages(i: Record<string, MessageObject>) {
  return i
}

export function waitInitialLocale(options: GetClientLocaleOptions | string) {
  if (typeof options === 'string') {
    return $locale.set(options)
  }
  return $locale.set(getClientLocale(options))
}

export { $locale as locale, loadLocale as preloadLocale } from './stores/locale'
export {
  $dictionary as dictionary,
  $locales as locales,
  addMessagesTo,
} from './stores/dictionary'
export { $isLoading as isLoading } from './stores/loading'
export { $format as format, $format as _, $format as t } from './stores/format'

// utilities
export { getClientLocale, merge }
export { customFormats, addCustomFormats } from './includes/formats'
export {
  flushQueue as waitLocale,
  registerLocaleLoader as register,
} from './includes/loaderQueue'
