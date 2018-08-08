import deepmerge from 'deepmerge'
import resolvePath from 'object-resolve-path'
import { capital, title, upper, lower } from './utils'
import Formatter from './formatter'

export function i18n(store, { dictionary }) {
  const formatter = new Formatter()
  let dictionaries = {}
  let currentLocale

  const getLocalizedMessage = (
    path,
    interpolations,
    locale = currentLocale,
    transformers = undefined,
  ) => {
    let message = resolvePath(dictionaries[locale], path)

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
        message => {
          const choice =
            typeof counter === 'number' ? Math.min(Math.abs(counter), 2) : 0
          return message.split('|')[choice]
        },
      ])
    },
  }

  store.i18n = {
    setLocale(locale) {
      store.fire('locale', locale)
    },
    extendDictionary(...list) {
      dictionaries = deepmerge.all([dictionaries, ...list])
    },
  }

  store.i18n.extendDictionary(dictionary)

  store.on('locale', newLocale => {
    currentLocale = newLocale
    const _ = getLocalizedMessage

    Object.assign(_, utilities)

    store.set({ locale: newLocale, _ })
  })

  return store
}
