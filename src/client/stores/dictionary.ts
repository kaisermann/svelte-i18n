import delve from 'dlv'
import merge from 'deepmerge'
import { writable, derived } from 'svelte/store'

import { Dictionary } from '../types/index'

import { getFallbackOf } from './locale'

let dictionary: Dictionary
const $dictionary = writable<Dictionary>({})

export function getLocaleDictionary(locale: string) {
  return (dictionary[locale] as Dictionary) || null
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
    const message = delve(localeDictionary, id)
    if (message) return message
  }
  return null
}

export function getClosestAvailableLocale(locale: string): string | null {
  if (locale == null || hasLocaleDictionary(locale)) return locale
  return getClosestAvailableLocale(getFallbackOf(locale))
}

export function addMessages(locale: string, ...partials: Dictionary[]) {
  partials = [nestingLoop(partials[0])]
  $dictionary.update(d => {
    dictionary[locale] = merge.all<Dictionary>(
      [getLocaleDictionary(locale) || {}].concat(partials)
    )
    return d
  })
}

function nestingLoop(maindict:any,dict:any = {}) {
  if (Object.keys(dict).length === 0) dict = {...maindict}
  for(let key in dict) {
    if (typeof dict[key] == 'object') dict[key] = nestingLoop(maindict,dict[key])
    else if (typeof dict[key] == 'string') {
      while(true) {
        let nested = Array.from(dict[key].matchAll(/\{\{(.*?)\}\}/g),(m:any)=>m[1])
        if (!nested || nested.constructor != Array || nested.length === 0) break
        nested.forEach( (k:string) =>{
          dict[key] = dict[key].replace(
            new RegExp(`\{\{${k}\}\}`),
            !maindict[k] && k!='' ? k.split('.').reduce((prev, curr) => prev && prev[curr] , maindict) : maindict[k] || ''
          )
        })
      }
    }
  }
  return dict
}

const $locales = derived([$dictionary], ([$dictionary]) =>
  Object.keys($dictionary)
)

$dictionary.subscribe(newDictionary => (dictionary = newDictionary))

export { $dictionary, $locales }
