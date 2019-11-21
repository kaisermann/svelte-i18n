import { writable, derived } from 'svelte/store'
import merge from 'deepmerge'

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

function addMessagesTo(locale: string, ...partials: any[]) {
  $dictionary.update(d => {
    dictionary[locale] = merge.all<any>(
      [dictionary[locale] || {}].concat(partials)
    )
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
  addMessagesTo,
}
