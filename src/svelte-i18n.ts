import { InterpolationObj, Sveltei18n, SvelteStore, Locale, Locales } from './interfaces'
import { capitalize, titlelize, upper, lower, getNestedProp } from './utils'

export default function(store: SvelteStore, locales: Locales) {
  store.locale = (locale: string) => store.fire('locale', locale)
  store.on('locale', function(locale: string) {
    const localeDict: Locale = locales[locale]
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
