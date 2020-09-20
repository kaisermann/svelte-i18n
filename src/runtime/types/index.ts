import { Formats } from 'intl-messageformat';

export interface DeepDictionary {
  [key: string]: DeepDictionary | string | string[];
}
export type LocaleDictionary = Record<string, string>;
export type Dictionary = Record<string, LocaleDictionary>;

export interface MessageObject {
  id?: string;
  locale?: string;
  format?: string;
  default?: string;
  values?: Record<string, string | number | Date>;
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
}
