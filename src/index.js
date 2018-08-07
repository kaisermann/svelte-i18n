import deepmerge from 'deepmerge'
import resolvePath from 'object-resolve-path'

import Formatter from './formatter'

export function i18n(store, localesList) {
  const formatter = new Formatter()
  const locales = deepmerge.all(localesList)
  let currentLocale: string

  const plural = (
    path,
    counter,
    interpolations,
    locale = currentLocale
  ) => {
    let message = resolvePath(locales[locale], path)

    if (!message) return path

    const choice = Math.min(Math.abs(counter), 2)
    message = message.split('|')[choice]

    if (!message) return path

    message = formatter.interpolate(message, interpolations).join('')

    return message.trim()
  }

  const changeLocale = (newLocale) => {
    currentLocale = newLocale
    const _ = (
      function(path, interpolations, locale = currentLocale) {
        let message = resolvePath(locales[locale], path)

        if (!message) return path

        message = formatter.interpolate(message, interpolations).join('')

        return message
      }
    )

    _.plural = plural

    store.set({ locale: newLocale, _ })
  }

  store.setLocale = (locale) => store.fire('locale', locale)
  store.on('locale', changeLocale)

  return store
}

export { capital, title, upper, lower } from './utils'
