import delve from 'dlv'
import merge from 'deepmerge'
import { writable, derived } from 'svelte/store'

import { Dictionary } from '../types/index'

import { getFallbackOf } from './locale'

import { lookupMessage } from '../includes/lookup'

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

export function nestingLoop(maindict:any,locale:string,dict:any = {}) {
  if (Object.keys(dict).length === 0) dict = {...maindict}
  for(const key in dict) {
    if (typeof dict[key] == 'object') dict[key] = nestingLoop(maindict,locale,dict[key])
    else if (typeof dict[key] == 'string') {
      let not_found:string[] = []
      while(true) {
        let nested = Array.from(dict[key].matchAll(/\{\{(.*?)\}\}/g),(m:any)=>m[1])
        nested = nested.filter(n=>!not_found.includes(n))
        if (!nested || nested.constructor != Array || nested.length === 0) break
        nested.forEach( (k:string) =>{
          const K = `{{${k}}}`
          const v = k!='' ? lookupMessage(k,locale) || K : ''
          if (v == K) return not_found.push(k)
          dict[key] = dict[key].replace( new RegExp(K),v )
        })
      }
    }
  }
  return dict
}

export function addMessages(locale: string, ...partials: Dictionary[]) {
  $dictionary.update(d => {
    dictionary[locale] = merge.all<Dictionary>(
      [getLocaleDictionary(locale) || {}].concat(partials)
    )
    d[locale]=nestingLoop(d[locale],locale)
    return d
  })
}

const $locales = derived([$dictionary], ([$dictionary]) =>
  Object.keys($dictionary)
)

$dictionary.subscribe(newDictionary => (dictionary = newDictionary))

export { $dictionary, $locales }
