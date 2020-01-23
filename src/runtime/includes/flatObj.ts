// could use a reduce, but a simple for-in has less footprint
export const flatObj = (obj: Record<string, any>, prefix = '') => {
  const flatted: Record<string, string> = {}
  for (const key in obj) {
    const flatKey = prefix + key
    // we want plain objects and arrays
    if (typeof obj[key] === 'object') {
      Object.assign(flatted, flatObj(obj[key], `${flatKey}.`))
    } else {
      flatted[flatKey] = obj[key]
    }
  }
  return flatted
}
