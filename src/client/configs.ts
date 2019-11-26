import { getClientLocale } from './includes/utils'
import { ConfigureOptions } from './types'
import { $locale } from './stores/locale'

let fallbackLocale: string = null
let loadingDelay = 200
const formats: any = {
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
}

export function getFallbackLocale() {
  return fallbackLocale
}

export function getLoadingDelay() {
  return loadingDelay
}

export function getFormats() {
  return formats
}

export function configure(opts: ConfigureOptions) {
  fallbackLocale = opts.fallbackLocale

  if (opts.initialLocale) {
    $locale.set(getClientLocale(opts.initialLocale) || fallbackLocale)
  } else {
    $locale.set(fallbackLocale)
  }

  if (opts.formats) {
    if ('number' in opts.formats)
      Object.assign(formats.number, opts.formats.number)
    if ('date' in opts.formats) Object.assign(formats.date, opts.formats.date)
    if ('time' in opts.formats) Object.assign(formats.time, opts.formats.time)
  }

  if (loadingDelay != null) loadingDelay = loadingDelay
}
