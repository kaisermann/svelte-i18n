export const capitalize = (str: string) => str.replace(/(^|\s)\S/, l => l.toUpperCase())
export const titlelize = (str: string) => str.replace(/(^|\s)\S/g, l => l.toUpperCase())
export const upper = (str: string) => str.toLocaleUpperCase()
export const lower = (str: string) => str.toLocaleLowerCase()

export const getNestedProp = (obj: { [prop: string]: any }, path: string) => {
  try {
    return path
      .replace('[', '.')
      .replace(']', '')
      .split('.')
      .reduce(function(o, property) {
        return o[property]
      }, obj)
  } catch (err) {
    return undefined
  }
}
