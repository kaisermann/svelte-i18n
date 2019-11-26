import { derived } from 'svelte/store'

import { Formatter, MessageObject } from '../types'
import { lookupMessage } from '../includes/lookup'
import { hasLocaleQueue } from '../includes/loaderQueue'
import { capital, upper, lower, title } from '../includes/utils'
import {
  getMessageFormatter,
  getTimeFormatter,
  getDateFormatter,
  getNumberFormatter,
} from '../includes/formats'

import { $dictionary } from './dictionary'
import { getCurrentLocale, getFallbacksOf, $locale } from './locale'

const formatMessage: Formatter = (id, options = {}) => {
  if (typeof id === 'object') {
    options = id as MessageObject
    id = options.id
  }

  const { values, locale = getCurrentLocale(), default: defaultValue } = options

  if (locale == null) {
    throw new Error(
      '[svelte-i18n] Cannot format a message without first setting the initial locale.'
    )
  }

  const message = lookupMessage(id, locale)

  if (!message) {
    console.warn(
      `[svelte-i18n] The message "${id}" was not found in "${getFallbacksOf(
        locale
      ).join('", "')}". ${
        hasLocaleQueue(getCurrentLocale())
          ? `\n\nNote: there are at least one loader still registered to this locale that wasn't executed.`
          : ''
      }`
    )

    return defaultValue || id
  }

  if (!values) return message
  return getMessageFormatter(message, locale).format(values)
}

formatMessage.time = (t, options) => getTimeFormatter(options).format(t)
formatMessage.date = (d, options) => getDateFormatter(options).format(d)
formatMessage.number = (n, options) => getNumberFormatter(options).format(n)
formatMessage.capital = (id, options) => capital(formatMessage(id, options))
formatMessage.title = (id, options) => title(formatMessage(id, options))
formatMessage.upper = (id, options) => upper(formatMessage(id, options))
formatMessage.lower = (id, options) => lower(formatMessage(id, options))

const $format = derived([$locale, $dictionary], () => formatMessage)

export { $format }
