// todo invalidate only keys with null values
import resolvePath from 'object-resolve-path'

import { hasLocaleDictionary } from '../stores/dictionary'

import { getGenericLocaleFrom } from './utils'

const lookupCache: Record<string, Record<string, string>> = {}

const addToCache = (path: string, locale: string, message: string) => {
  if (!message) return message
  if (!(locale in lookupCache)) lookupCache[locale] = {}
  if (!(path in lookupCache[locale])) lookupCache[locale][path] = message
  return message
}

export const removeFromLookupCache = (locale: string) => {
  delete lookupCache[locale]
}

export const lookupMessage = (
  dictionary: any,
  path: string,
  locale: string
): string => {
  if (locale == null) return null
  if (locale in lookupCache && path in lookupCache[locale]) {
    return lookupCache[locale][path]
  }
  if (hasLocaleDictionary(locale)) {
    if (path in dictionary[locale]) {
      return addToCache(path, locale, dictionary[locale][path])
    }
    const message = resolvePath(dictionary[locale], path)
    if (message) return addToCache(path, locale, message)
  }

  return addToCache(
    path,
    locale,
    lookupMessage(dictionary, path, getGenericLocaleFrom(locale))
  )
}
