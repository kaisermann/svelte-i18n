import { GetClientLocaleOptions } from '../types'

export function capital(str: string) {
  return str.replace(/(^|\s)\S/, l => l.toLocaleUpperCase())
}

export function title(str: string) {
  return str.replace(/(^|\s)\S/g, l => l.toLocaleUpperCase())
}

export function upper(str: string) {
  return str.toLocaleUpperCase()
}

export function lower(str: string) {
  return str.toLocaleLowerCase()
}

const getFromURL = (urlPart: string, key: string) => {
  const keyVal = urlPart
    .substr(1)
    .split('&')
    .find(i => i.indexOf(key) === 0)

  if (keyVal) {
    return keyVal.split('=').pop()
  }
}

const getFirstMatch = (base: string, pattern: RegExp) => {
  const match = pattern.exec(base)
  if (!match) return null
  return match[1] || null
}

export const getClientLocale = ({
  navigator,
  hash,
  search,
  pathname,
  hostname,
  default: defaultLocale,
  fallback = defaultLocale,
}: GetClientLocaleOptions) => {
  let locale

  if (typeof window === 'undefined') return fallback

  if (hostname) {
    locale = getFirstMatch(window.location.hostname, hostname)
    if (locale) return locale
  }

  if (pathname) {
    locale = getFirstMatch(window.location.pathname, pathname)
    if (locale) return locale
  }

  if (navigator) {
    // istanbul ignore else
    locale = window.navigator.language || window.navigator.languages[0]
    if (locale) return locale
  }

  if (search) {
    locale =
      typeof search === 'string'
        ? getFromURL(window.location.search, search)
        : getFirstMatch(window.location.search, search)
    if (locale) return locale
  }

  if (hash) {
    locale =
      typeof hash === 'string'
        ? getFromURL(window.location.hash, hash)
        : getFirstMatch(window.location.hash, hash)
    if (locale) return locale
  }

  return fallback
}
