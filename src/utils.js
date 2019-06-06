export const capital = str => str.replace(/(^|\s)\S/, l => l.toUpperCase())
export const title = str => str.replace(/(^|\s)\S/g, l => l.toUpperCase())
export const upper = str => str.toLocaleUpperCase()
export const lower = str => str.toLocaleLowerCase()