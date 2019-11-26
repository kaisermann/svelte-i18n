import IntlMessageFormat from 'intl-messageformat'
import memoize from 'fast-memoize'

import { MemoizedIntlFormatter } from '../types'
import { getCurrentLocale } from '../stores/locale'
import { getFormats } from '../configs'

const getIntlFormatterOptions = (
  type: 'time' | 'number' | 'date',
  name: string
): any => {
  const formats = getFormats()
  if (type in formats && name in formats[type]) {
    return formats[type][name]
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
> = memoize((options = {}) => {
  const locale = options.locale || getCurrentLocale()
  if (options.format) {
    const format = getIntlFormatterOptions('number', options.format)
    if (format) options = format
  }
  return new Intl.NumberFormat(locale, options)
})

export const getDateFormatter: MemoizedIntlFormatter<
  Intl.DateTimeFormat,
  Intl.DateTimeFormatOptions
> = memoize((options = { format: 'short' }) => {
  const locale = options.locale || getCurrentLocale()

  const format = getIntlFormatterOptions('date', options.format)
  if (format) options = format

  return new Intl.DateTimeFormat(locale, options)
})

export const getTimeFormatter: MemoizedIntlFormatter<
  Intl.DateTimeFormat,
  Intl.DateTimeFormatOptions
> = memoize((options = { format: 'short' }) => {
  const locale = options.locale || getCurrentLocale()

  const format = getIntlFormatterOptions('time', options.format)
  if (format) options = format

  return new Intl.DateTimeFormat(locale, options)
})

export const getMessageFormatter = memoize(
  (message: string, locale: string) =>
    new IntlMessageFormat(message, locale, getFormats())
)
