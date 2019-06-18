export const capital = str => str.replace(/(^|\s)\S/, l => l.toUpperCase())
export const title = str => str.replace(/(^|\s)\S/g, l => l.toUpperCase())
export const upper = str => str.toLocaleUpperCase()
export const lower = str => str.toLocaleLowerCase()

export const getClientLocale = ({ navigator, hash, search, fallback } = {}) => {
  let locale

  const getFromURL = (urlPart, key) => {
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

    if (search) {
      locale = getFromURL(window.location.search, search)
    }

    if (hash) {
      locale = getFromURL(window.location.hash, hash)
    }
  }

  return locale || fallback
}
