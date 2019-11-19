export const capital = (str: string) =>
  str.replace(/(^|\s)\S/, l => l.toLocaleUpperCase())
export const title = (str: string) =>
  str.replace(/(^|\s)\S/g, l => l.toLocaleUpperCase())
export const upper = (str: string) => str.toLocaleUpperCase()
export const lower = (str: string) => str.toLocaleLowerCase()

export const getClientLocale = ({
  navigator,
  hash,
  search,
  default: defaultLocale,
  fallback = defaultLocale,
}: {
  navigator?: boolean
  hash?: string
  search?: string
  fallback?: string
  default?: string
}) => {
  let locale

  const getFromURL = (urlPart: string, key: string) => {
    const keyVal = urlPart
      .substr(1)
      .split('&')
      .find(i => i.indexOf(key) === 0)

    if (keyVal) {
      return keyVal.split('=').pop()
    }
  }

  // istanbul ignore else
  if (typeof window !== 'undefined') {
    if (navigator) {
      // istanbul ignore next
      locale = window.navigator.language || window.navigator.languages[0]
    }

    if (search && !locale) {
      locale = getFromURL(window.location.search, search)
    }

    if (hash && !locale) {
      locale = getFromURL(window.location.hash, hash)
    }
  }

  return locale || defaultLocale || fallback
}
