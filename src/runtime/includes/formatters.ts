import IntlMessageFormat from 'intl-messageformat'

import { MemoizedIntlFormatter } from '../types'
import { getCurrentLocale } from '../stores/locale'
import { getOptions } from '../configs'

import { monadicMemoize } from './memoize'

const getIntlFormatterOptions = (
  type: 'time' | 'number' | 'date',
  name: string
): any => {
  const formats = getOptions().formats
  if (type in formats && name in formats[type]) {
    return formats[type][name]
  }

  throw new Error(`[svelte-i18n] Unknown "${name}" ${type} format.`)
}

const createNumberFormatter: MemoizedIntlFormatter<
  Intl.NumberFormat,
  Intl.NumberFormatOptions
> = monadicMemoize(({ locale, format, ...options }) => {
  if (locale == null) {
    throw new Error('[svelte-i18n] A "locale" must be set to format numbers')
  }

  if (format) {
    options = getIntlFormatterOptions('number', format)
  }

  return new Intl.NumberFormat(locale, options)
})
export const getNumberFormatter = ({ locale = getCurrentLocale(), ...args } = {}) => createNumberFormatter({ locale, ...args })

const createDateFormatter: MemoizedIntlFormatter<
  Intl.DateTimeFormat,
  Intl.DateTimeFormatOptions
> = monadicMemoize(({ locale, format, ...options }) => {
  if (locale == null) {
    throw new Error('[svelte-i18n] A "locale" must be set to format dates')
  }

  if (format) options = getIntlFormatterOptions('date', format)
  else if (Object.keys(options).length === 0) {
    options = getIntlFormatterOptions('date', 'short')
  }

  return new Intl.DateTimeFormat(locale, options)
})
export const getDateFormatter = ({ locale = getCurrentLocale(), ...args } = {}) => createDateFormatter({ locale, ...args })

const createTimeFormatter: MemoizedIntlFormatter<
  Intl.DateTimeFormat,
  Intl.DateTimeFormatOptions
> = monadicMemoize(({ locale, format, ...options }) => {
  if (locale == null) {
    throw new Error(
      '[svelte-i18n] A "locale" must be set to format time values'
    )
  }

  if (format) options = getIntlFormatterOptions('time', format)
  else if (Object.keys(options).length === 0) {
    options = getIntlFormatterOptions('time', 'short')
  }

  return new Intl.DateTimeFormat(locale, options)
})
export const getTimeFormatter = ({ locale = getCurrentLocale(), ...args } = {}) => createTimeFormatter({ locale, ...args })

export const getMessageFormatter = monadicMemoize(
  (message: string, locale: string = getCurrentLocale()) =>
    new IntlMessageFormat(message, locale, getOptions().formats)
)
