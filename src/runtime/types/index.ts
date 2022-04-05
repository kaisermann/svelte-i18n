import type { Formats, FormatXMLElementFn } from 'intl-messageformat';

export interface LocaleDictionary {
  [key: string]:
    | LocaleDictionary
    | string
    | Array<string | LocaleDictionary>
    | null;
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
  id: string;
  locale?: string;
  format?: string;
  default?: string;
  values?: InterpolationValues;
}

export type MessageFormatter = (
  id: string | MessageObject,
  options?: Omit<MessageObject, 'id'>,
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

export type JSONGetter = <T>(id: string, locale?: string | null) => T;

type IntlFormatterOptions<T> = T & {
  format?: string;
  locale?: string;
};

export interface MemoizedIntlFormatter<T, U> {
  (options: IntlFormatterOptions<U>): T;
}

export interface MemoizedIntlFormatterOptional<T, U> {
  (options?: IntlFormatterOptions<U>): T;
}

export interface MessagesLoader {
  (): Promise<any>;
}

export type OnMissingMessageHandler = (
  langs: string[],
  id: string,
  defaultValue: string | undefined,
) => void;

export interface ConfigureOptions {
  fallbackLocale: string;
  initialLocale?: string | null;
  formats: Formats;
  loadingDelay: number;
  warnOnMissingMessages: boolean;
  onMissingMessageHandler: OnMissingMessageHandler;
  ignoreTag: boolean;
}

export type ConfigureOptionsInit = Pick<ConfigureOptions, 'fallbackLocale'> &
  Partial<Omit<ConfigureOptions, 'fallbackLocale'>>;
