export type InterpolationObj = Array<any> | Object

export interface TranslationGetter {
  (str: string, values: Array<String | Number> | Object): string
}

export interface Sveltei18n {
  (str: string, values: Array<String | Number> | Object): string
  capitalize: TranslationGetter
  titlelize: TranslationGetter
  upper: TranslationGetter
  lower: TranslationGetter
}
