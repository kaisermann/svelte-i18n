import { writable, derived } from 'svelte/store'

import { LocaleDictionary, DeepDictionary, Dictionary } from '../types/index'
import { flatObj } from '../includes/utils'

import { getFallbackOf } from './locale'

let dictionary: Dictionary
const $dictionary = writable<Dictionary>({})

export function getLocaleDictionary(locale: string) {
  return (dictionary[locale] as LocaleDictionary) || null
}

export function getDictionary() {
  return dictionary
}

export function hasLocaleDictionary(locale: string) {
  return locale in dictionary
}

export function getMessageFromDictionary(locale: string, id: string) {
  if (hasLocaleDictionary(locale)) {
    const localeDictionary = getLocaleDictionary(locale)
    if (id in localeDictionary) {
      return localeDictionary[id]
    }
  }
  return null
}

export function getClosestAvailableLocale(locale: string): string | null {
  if (locale == null || hasLocaleDictionary(locale)) return locale
  return getClosestAvailableLocale(getFallbackOf(locale))
}

export function addMessages(locale: string, ...partials: DeepDictionary[]) {
  const flattedPartials = partials.map(partial => flatObj(partial))

  $dictionary.update(d => {
    d[locale] = Object.assign(d[locale] || {}, ...flattedPartials)
    return d
  })
}

const $locales = derived([$dictionary], ([$dictionary]) =>
  Object.keys($dictionary)
)

$dictionary.subscribe(newDictionary => (dictionary = newDictionary))

export { $dictionary, $locales }
