import deepmerge from 'deepmerge'
import resolvePath from 'object-resolve-path'

import { InterpolationObj, Sveltei18n, SvelteStore, LocaleDictionary, Locales } from './interfaces'
import { capitalize, titlelize, upper, lower } from './utils'
import Formatter from './formatter'

export default function(store: SvelteStore, localesList: Array<Locales>) {
  const formatter = new Formatter()
  const locales: Locales = deepmerge.all(localesList)

  store.setLocale = (locale: string) => store.fire('locale', locale)
  store.on('locale', function(locale: string) {
    const localeDict: LocaleDictionary = locales[locale]
    const _ = <Sveltei18n>function(id, values) {
      let message = resolvePath(localeDict, id) || id
      message = formatter.interpolate(message, values).join('')
      return message
    }

    _.capitalize = (id, values) => capitalize(_(id, values))
    _.titlelize = (id, values) => titlelize(_(id, values))
    _.upper = (id, values) => upper(_(id, values))
    _.lower = (id, values) => lower(_(id, values))

    store.set({ locale, _ })
  })
}
