import { MessageObject } from './types'

// defineMessages allow us to define and extract dynamic message ids
export function defineMessages(i: Record<string, MessageObject>) {
  return i
}

export { init } from './configs'
export { $locale as locale } from './stores/locale'
export {
  $dictionary as dictionary,
  $locales as locales,
  addMessages,
} from './stores/dictionary'
export { $isLoading as isLoading } from './stores/loading'
export { $format as format, $format as _, $format as t } from './stores/format'

// utilities
export {
  flushQueue as waitLocale,
  registerLocaleLoader as register,
} from './includes/loaderQueue'
