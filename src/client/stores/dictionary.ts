import { writable, derived } from 'svelte/store'

let dictionary: Record<string, Record<string, any>>

const $dictionary = writable<typeof dictionary>({})
$dictionary.subscribe(newDictionary => {
  dictionary = newDictionary
})

function getDictionary() {
  return dictionary
}

function hasLocaleDictionary(locale: string) {
  return locale in dictionary
}

const $locales = derived([$dictionary], ([$dictionary]) =>
  Object.keys($dictionary)
)

export { $dictionary, $locales, getDictionary, hasLocaleDictionary }
