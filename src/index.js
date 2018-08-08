
import { capital, title, upper, lower } from './utils'
import Formatter from './formatter'

const resolvePath = a => a

export function i18n(store, localesList) {
  const formatter = new Formatter()
  const locales = {} // deepmerge.all(localesList)
  let currentLocale

  const getLocalizedMessage = (
    path,
    interpolations,
    locale = currentLocale,
    transformers = undefined,
  ) => {
    let message = resolvePath(locales[locale], path)

    if (!message) return path

    if (transformers) {
      for (let i = 0, len = transformers.length; i < len; i++) {
        message = transformers[i](message)
      }
    }

    if (interpolations) {
      message = formatter.interpolate(message, interpolations).join('')
    }

    return message.trim()
  }

  const utilities = {
    capital(...args) {
      return capital(getLocalizedMessage(...args))
    },
    title(...args) {
      return title(getLocalizedMessage(...args))
    },
    upper(...args) {
      return upper(getLocalizedMessage(...args))
    },
    lower(...args) {
      return lower(getLocalizedMessage(...args))
    },
    plural(path, counter, interpolations, locale) {
      return getLocalizedMessage(path, interpolations, locale, [
        message => message.split('|')[Math.min(Math.abs(counter), 2)],
      ])
    },
  }

  store.setLocale = locale => store.fire('locale', locale)
  store.on('locale', newLocale => {
    currentLocale = newLocale
    const _ = getLocalizedMessage

    Object.assign(_, utilities)
    store.set({ locale: newLocale, _ })
  })

  return store
}
