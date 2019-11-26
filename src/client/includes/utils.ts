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

const getFromQueryString = (queryString: string, key: string) => {
  const keyVal = queryString.split('&').find(i => i.indexOf(`${key}=`) === 0)

  if (keyVal) {
    return keyVal.split('=').pop()
  }
  return null
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
}: GetClientLocaleOptions) => {
  let locale

  // istanbul ignore next
  if (typeof window === 'undefined') return null

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
    locale = getFromQueryString(window.location.search.substr(1), search)
    if (locale) return locale
  }

  if (hash) {
    locale = getFromQueryString(window.location.hash.substr(1), hash)
    if (locale) return locale
  }

  return null
}
