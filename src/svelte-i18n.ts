import { InterpolationObj, Sveltei18n, SvelteStore, LocaleDictionary, Locales } from './interfaces'
import { capitalize, titlelize, upper, lower, getNestedProp } from './utils'
import deepmerge from 'deepmerge'

export default function(store: SvelteStore, localesList: Array<Locales>) {
  const locales: Locales = deepmerge.all(localesList)

  store.locale = (locale: string) => store.fire('locale', locale)
  store.on('locale', function(locale: string) {
    const localeDict: LocaleDictionary = locales[locale]
    const _ = <Sveltei18n>function(id, values) {
      return getNestedProp(localeDict, id) || id
    }

    _.capitalize = (id, values) => capitalize(_(id, values))
    _.titlelize = (id, values) => titlelize(_(id, values))
    _.upper = (id, values) => upper(_(id, values))
    _.lower = (id, values) => lower(_(id, values))

    store.set({ locale, _ })
  })
}
