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

export type JSONGetter = <T>(id: string, locale?: string) => T;

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

export type MissingKeyHandlerInput = {
  locale: string;
  id: string;
  defaultValue: string | undefined;
};

export type MissingKeyHandlerOutput = string | void | undefined;

export type MissingKeyHandler = (
  input: MissingKeyHandlerInput,
) => MissingKeyHandlerOutput;

export interface ConfigureOptions {
  /** The global fallback locale * */
  fallbackLocale: string;
  /** The app initial locale * */
  initialLocale?: string | null;
  /** Custom time/date/number formats * */
  formats: Formats;
  /** Loading delay interval * */
  loadingDelay: number;
  /**
   * @deprecated Use `handleMissingMessage` instead.
   * */
  warnOnMissingMessages?: boolean;
  /**
   * Optional method that is executed whenever a message is missing.
   * It may return a string to use as the fallback.
   */
  handleMissingMessage?: MissingKeyHandler;
  /**
   * Whether to treat HTML/XML tags as string literal instead of parsing them as tag token.
   * When this is false we only allow simple tags without any attributes
   * */
  ignoreTag: boolean;
}

export type ConfigureOptionsInit = Pick<ConfigureOptions, 'fallbackLocale'> &
  Partial<Omit<ConfigureOptions, 'fallbackLocale'>>;
