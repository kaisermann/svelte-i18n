import type { FormatXMLElementFn, Formats } from 'intl-messageformat';

export interface LocaleDictionary {
  [key: string]: LocaleDictionary | string | Array<string | LocaleDictionary>;
}

export type LocalesDictionary = {
  [key: string]: LocaleDictionary;
};

export type InterpolationValues =
  | Record<
      string,
      | string
      | number
      | boolean
      | Date
      | FormatXMLElementFn<unknown>
      | null
      | undefined
    >
  | undefined;

export interface MessageObject {
  id?: string;
  locale?: string;
  format?: string;
  default?: string;
  values?: InterpolationValues;
}

export type MessageFormatter = (
  id: string | MessageObject,
  options?: MessageObject,
) => string;

export type TimeFormatter = (
  d: Date | number,
  options?: IntlFormatterOptions<Intl.DateTimeFormatOptions>,
) => string;

export type DateFormatter = (
  d: Date | number,
  options?: IntlFormatterOptions<Intl.DateTimeFormatOptions>,
) => string;

export type NumberFormatter = (
  d: number,
  options?: IntlFormatterOptions<Intl.NumberFormatOptions>,
) => string;

export type JSONGetter = <T>(id: string, locale?: string) => T;

type IntlFormatterOptions<T> = T & {
  format?: string;
  locale?: string;
};

export interface MemoizedIntlFormatter<T, U> {
  (options?: IntlFormatterOptions<U>): T;
}

export interface MessagesLoader {
  (): Promise<any>;
}

export interface ConfigureOptions {
  fallbackLocale: string;
  formats?: Partial<Formats>;
  initialLocale?: string;
  loadingDelay?: number;
  warnOnMissingMessages?: boolean;
  ignoreTag?: boolean;
}
