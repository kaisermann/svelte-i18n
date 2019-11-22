import merge from 'deepmerge'
import { writable, derived } from 'svelte/store'

import { LocaleDictionary } from '../types/index'

let dictionary: LocaleDictionary

const $dictionary = writable<LocaleDictionary>({})
$dictionary.subscribe(newDictionary => {
  dictionary = newDictionary
})

function getDictionary() {
  return dictionary
}

function hasLocaleDictionary(locale: string) {
  return locale in dictionary
}

function addMessages(locale: string, ...partials: LocaleDictionary[]) {
  $dictionary.update(d => {
    dictionary[locale] = merge.all([dictionary[locale] || {}].concat(partials))
    return d
  })
}

const $locales = derived([$dictionary], ([$dictionary]) =>
  Object.keys($dictionary)
)

export {
  $dictionary,
  $locales,
  getDictionary,
  hasLocaleDictionary,
  addMessages,
}
