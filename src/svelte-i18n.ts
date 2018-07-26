import { InterpolationObj, Sveltei18n } from './interfaces'

export default function() {
  const _ = <Sveltei18n>function(str: string, values: InterpolationObj) {
    return str
  }

  Object.assign(_, {
    capitalize: (id: string, values: InterpolationObj) =>
      _(id, values).replace(/(^|\s)\S/, l => l.toUpperCase()),
    titlelize: (id: string, values: InterpolationObj) =>
      _(id, values).replace(/(^|\s)\S/g, l => l.toUpperCase()),
    upper: (id: string, values: InterpolationObj) => _(id, values).toLocaleUpperCase(),
    lower: (id: string, values: InterpolationObj) => _(id, values).toLocaleLowerCase()
  })

  return _
}
