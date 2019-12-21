import { getMessageFromDictionary } from '../stores/dictionary'
import { getFallbackOf } from '../stores/locale'

export const lookupCache: Record<string, Record<string, string>> = {}

const addToCache = (path: string, locale: string, message: string) => {
  if (!message) return message
  if (!(locale in lookupCache)) lookupCache[locale] = {}
  if (!(path in lookupCache[locale])) lookupCache[locale][path] = message
  return message
}

export const lookupMessage = (path: string, locale: string, cache:boolean = true): string => {
  if (locale == null) return null
  if (locale in lookupCache && path in lookupCache[locale]) {
    return lookupCache[locale][path]
  }

  const message = getMessageFromDictionary(locale, path)
  if (message) return message

  if (cache) return addToCache(path, locale, lookupMessage(path, getFallbackOf(locale)))
}
