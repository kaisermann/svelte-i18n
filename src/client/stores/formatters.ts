import { derived } from 'svelte/store'
import {
  getTimeFormatter,
  getDateFormatter,
  getNumberFormatter,
  formatTime,
  formatDate,
  formatNumber,
  formatMessage
} from 'icu-helpers';


import { $dictionary } from './dictionary'
import { $locale } from './locale'
// import { lookup } from '../includes/lookup'
// import { hasLocaleQueue } from '../includes/loaderQueue'
// import { getCurrentLocale, getRelatedLocalesOf, $locale } from './locale'
export const $formatTime = derived([$locale], () => formatTime)
export const $formatDate = derived([$locale], () => formatDate)
export const $formatNumber = derived([$locale], () => formatNumber)
export const $format = derived([$locale, $dictionary], () => formatMessage)
export {
  getTimeFormatter,
  getDateFormatter,
  getNumberFormatter
}

