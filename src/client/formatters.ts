import IntlMessageFormat, { Formats } from 'intl-messageformat'
import memoize from 'micro-memoize'

import { MemoizedIntlFormatter } from './types'

export const customFormats: any = {
  number: {
    scientific: { notation: 'scientific' },
    engineering: { notation: 'engineering' },
    compactLong: { notation: 'compact', compactDisplay: 'long' },
    compactShort: { notation: 'compact', compactDisplay: 'short' },
  },
  date: {},
  time: {},
}

export function addCustomFormats(formats: Partial<Formats>) {
  if ('number' in formats) Object.assign(customFormats.number, formats.number)
  if ('date' in formats) Object.assign(customFormats.date, formats.date)
  if ('time' in formats) Object.assign(customFormats.time, formats.time)
}

const getIntlFormatterOptions = (
  type: 'time' | 'number' | 'date',
  name: string,
): any => {
  if (type in customFormats && name in customFormats[type]) {
    return customFormats[type][name]
  }

  if (
    type in IntlMessageFormat.formats &&
    name in IntlMessageFormat.formats[type]
  ) {
    return (IntlMessageFormat.formats[type] as any)[name]
  }

  return null
}

export const getNumberFormatter: MemoizedIntlFormatter<
  Intl.NumberFormat,
  Intl.NumberFormatOptions
> = memoize((locale, options = {}) => {
  if (options.locale) locale = options.locale
  if (options.format) {
    const format = getIntlFormatterOptions('number', options.format)
    if (format) options = format
  }
  return new Intl.NumberFormat(locale, options)
})

export const getDateFormatter: MemoizedIntlFormatter<
  Intl.DateTimeFormat,
  Intl.DateTimeFormatOptions
> = memoize((locale, options = { format: 'short' }) => {
  if (options.locale) locale = options.locale
  if (options.format) {
    const format = getIntlFormatterOptions('date', options.format)
    if (format) options = format
  }
  return new Intl.DateTimeFormat(locale, options)
})

export const getTimeFormatter: MemoizedIntlFormatter<
  Intl.DateTimeFormat,
  Intl.DateTimeFormatOptions
> = memoize((locale, options = { format: 'short' }) => {
  if (options.locale) locale = options.locale
  if (options.format) {
    const format = getIntlFormatterOptions('time', options.format)
    if (format) options = format
  }
  return new Intl.DateTimeFormat(locale, options)
})

export const getMessageFormatter = memoize(
  (message: string, locale: string) =>
    new IntlMessageFormat(message, locale, customFormats),
)
