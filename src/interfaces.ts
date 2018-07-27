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
export interface SvelteEventListener {
  cancel(): void
}

export interface SvelteStore {
  on: (event: string, callback: Function) => SvelteEventListener
  set: (newState: Object) => void
  fire: (event: string, value: any) => void
  [prop: string]: any
}

export interface LocaleDictionary {
  [id: string]: string | Array<string> | LocaleDictionary
}
export interface Locales {
  [locale: string]: LocaleDictionary
}
