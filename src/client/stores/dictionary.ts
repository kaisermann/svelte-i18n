import merge from 'deepmerge'
import { writable, derived } from 'svelte/store'

import { LocaleDictionary } from '../types/index'

import { getFallbackOf } from './locale'

let dictionary: LocaleDictionary
const $dictionary = writable<LocaleDictionary>({})

export function getDictionary() {
  return dictionary
}

export function hasLocaleDictionary(locale: string) {
  return locale in dictionary
}

export function getAvailableLocale(locale: string): string | null {
  if (locale in dictionary || locale == null) return locale
  return getAvailableLocale(getFallbackOf(locale))
}

export function addMessages(locale: string, ...partials: LocaleDictionary[]) {
  $dictionary.update(d => {
    dictionary[locale] = merge.all([dictionary[locale] || {}].concat(partials))
    return d
  })
}

const $locales = derived([$dictionary], ([$dictionary]) =>
  Object.keys($dictionary)
)

$dictionary.subscribe(newDictionary => (dictionary = newDictionary))

export { $dictionary, $locales }
