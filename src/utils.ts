export const capitalize = (str: string) => str.replace(/(^|\s)\S/, l => l.toUpperCase())
export const titlelize = (str: string) => str.replace(/(^|\s)\S/g, l => l.toUpperCase())
export const upper = (str: string) => str.toLocaleUpperCase()
export const lower = (str: string) => str.toLocaleLowerCase()

export const isObject = (obj: any) => obj !== null && typeof obj === 'object'

export function warn(msg: string, err?: Error): void {
  if (typeof console !== 'undefined') {
    console.warn(`[svelte-i18n] ${msg}`)
    if (err) {
      console.warn(err.stack)
    }
  }
}
