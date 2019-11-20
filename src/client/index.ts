import merge from 'deepmerge'

import { MessageObject } from './types'

// defineMessages allow us to define and extract dynamic message ids
const defineMessages = (i: Record<string, MessageObject>) => i

export { $locale as locale, loadLocale as preloadLocale } from './stores/locale'
export {
  $dictionary as dictionary,
  $locales as locales,
} from './stores/dictionary'
export { $loading as loading } from './stores/loading'
export { $format as format, $format as _, $format as t } from './stores/format'

// utilities
export { defineMessages, merge }
export { customFormats, addCustomFormats } from './includes/formats'
export { getClientLocale } from './includes/utils'
export {
  flushQueue as waitLocale,
  registerLocaleLoader as register,
} from './includes/loaderQueue'
