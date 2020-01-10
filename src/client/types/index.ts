import { Formats } from 'intl-messageformat'

export interface Dictionary {
  [key: string]: string | number | (string|number)[] | Dictionary | Dictionary[]
}

export interface MessageObject {
  id?: string
  locale?: string
  format?: string
  default?: string
  values?: Record<string, string | number | Date>
}

interface FormatterFn {
  (id: string | MessageObject, options?: MessageObject): string
}

type IntlFormatterOptions<T> = T & {
  format?: string
  locale?: string
}

export interface MemoizedIntlFormatter<T, U> {
  (options?: IntlFormatterOptions<U>): T
}

export interface Formatter extends FormatterFn {
  time: (
    d: Date | number,
    options?: IntlFormatterOptions<Intl.DateTimeFormatOptions>
  ) => string
  date: (
    d: Date | number,
    options?: IntlFormatterOptions<Intl.DateTimeFormatOptions>
  ) => string
  number: (
    d: number,
    options?: IntlFormatterOptions<Intl.NumberFormatOptions>
  ) => string
  capital: FormatterFn
  title: FormatterFn
  upper: FormatterFn
  lower: FormatterFn
}

export interface MessagesLoader {
  (): Promise<any>
}

export interface GetClientLocaleOptions {
  navigator?: boolean
  hash?: string
  search?: string
  pathname?: RegExp
  hostname?: RegExp
}

export interface ConfigureOptions {
  fallbackLocale: string
  initialLocale?: string | GetClientLocaleOptions
  formats?: Partial<Formats>
  loadingDelay?: number
}
