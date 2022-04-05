<!-- @import "[TOC]" {cmd="toc" depthFrom=4 depthTo=4 orderedList=false} -->

<!-- code_chunk_output -->

- [`init`](#init)
- [`getLocaleFromHostname`](#getlocalefromhostname)
- [`getLocaleFromPathname`](#getlocalefrompathname)
- [`getLocaleFromNavigator`](#getlocalefromnavigator)
- [`getLocaleFromQueryString`](#getlocalefromquerystring)
- [`getLocaleFromHash`](#getlocalefromhash)
- [`addMessages`](#addmessages)
- [`register`](#register)
- [`waitLocale`](#waitlocale)
- [`getDateFormatter`/`getTimeFormatter`/`getNumberFormatter`](#getdateformattergettimeformattergetnumberformatter)
- [`getMessageFormatter`](#getmessageformatter)

<!-- /code_chunk_output -->

#### `init`

> `import { init } from 'svelte-i18n'`

`init(options: InitOptions): void`

Method responsible for configuring some of the library behaviours such as the global fallback and initial locales. Must be called before setting a locale and displaying your view.

```ts
interface InitOptions {
  /** The global fallback locale **/
  fallbackLocale: string;
  /** The app initial locale **/
  initialLocale?: string | null;
  /** Custom time/date/number formats **/
  formats?: Formats;
  /** Loading delay interval **/
  loadingDelay?: number;
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
```

**Example**:

```js
import { init } from 'svelte-i18n';

init({
  // fallback to en if current locale is not in the dictionary
  fallbackLocale: 'en',
  initialLocale: 'pt-br',
});
```

##### Custom formats

It's possible to define custom format styles via the `formats` property if you want to quickly pass a set of options to the underlying `Intl` formatter.

```ts
interface Formats {
  number: Record<string, Intl.NumberFormatOptions>;
  date: Record<string, Intl.DateTimeFormatOptions>;
  time: Record<string, Intl.DateTimeFormatOptions>;
}
```

Please refer to the [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat) and [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat) documentations to see available formatting options.

**Example**:

```js
import { init } from 'svelte-i18n';

init({
  // fallback to en if current locale is not in the dictionary
  fallbackLocale: 'en',
  formats: {
    number: {
      EUR: { style: 'currency', currency: 'EUR' },
    },
  },
});
```

```html
<div>{$_.number(123456.789, { format: 'EUR' })}</div>
<!-- 123.456,79 € -->
```

#### `getLocaleFromHostname`

> `import { getLocaleFromHostname } from 'svelte-i18n'`

`getLocaleFromHostname(hostnamePattern: RegExp): string`
Utility method to help getting a initial locale based on a pattern of the current `hostname`.

**Example**:

```js
import { init, getLocaleFromHostname } from 'svelte-i18n';

init({
  // fallback to en if current locale is not in the dictionary
  fallbackLocale: 'en',
  initialLocale: getLocaleFromHostname(/^(.*?)\./),
});
```

#### `getLocaleFromPathname`

> `import { getLocaleFromPathname } from 'svelte-i18n'`

`getLocaleFromPathname(pathnamePattern: RegExp): string`

Utility method to help getting a initial locale based on a pattern of the current `pathname`.

**Example**:

```js
import { init, getLocaleFromPathname } from 'svelte-i18n';

init({
  // fallback to en if current locale is not in the dictionary
  fallbackLocale: 'en',
  initialLocale: getLocaleFromPathname(/^\/(.*?)\//),
});
```

#### `getLocaleFromNavigator`

> `import { getLocaleFromNavigator } from 'svelte-i18n'`

`getLocaleFromNavigator(): string`

Utility method to help getting a initial locale based on the browser's `navigator` settings.

**Example**:

```js
import { init, getLocaleFromNavigator } from 'svelte-i18n';

init({
  // fallback to en if current locale is not in the dictionary
  fallbackLocale: 'en',
  initialLocale: getLocaleFromNavigator(),
});
```

#### `getLocaleFromQueryString`

> `import { getLocaleFromQueryString } from 'svelte-i18n'`

`getLocaleFromQueryString(queryKey: string): string`

Utility method to help getting a initial locale based on a query string value.

```js
import { init, getLocaleFromQueryString } from 'svelte-i18n';

init({
  // fallback to en if current locale is not in the dictionary
  fallbackLocale: 'en',
  initialLocale: getLocaleFromQueryString('lang'),
});
```

#### `getLocaleFromHash`

> `import { getLocaleFromHash } from 'svelte-i18n'`

`getLocaleFromHash(hashKey: string): string`

Utility method to help getting a initial locale based on a hash `{key}={value}` string.

**Example**:

```js
import { init, getLocaleFromHash } from 'svelte-i18n';

init({
  // fallback to en if current locale is not in the dictionary
  fallbackLocale: 'en',
  initialLocale: getLocaleFromHash('lang'),
});
```

#### `addMessages`

> `import { addMessages } from 'svelte-i18n`

`addMessages(locale: string, ...dicts: Dictionary[]): void`

Merge one ore more dictionary of messages with the `locale` dictionary.

**Example**:

```js
addMessages('en', { field_1: 'Name' })
addMessages('en', { field_2: 'Last Name' })

addMessages('pt', { field_1: 'Nome' })
addMessages('pt', { field_2: 'Sobrenome' })

// Results in dictionary
{
  en: {
    field_1: 'Name',
    field_2: 'Last Name'
  },
  pt: {
    field_1: 'Nome',
    field_2: 'Sobrenome'
  }
}
```

#### `register`

> `import { register } from 'svelte-i18n'`

`register(locale: string, loader: () => Promise<object>): void`

Registers an async message `loader` for the specified `locale`. The loader queue is executed when changing to `locale` or when calling `waitLocale(locale)`.

**Example**:

```js
import { register } from 'svelte-i18n';

register('en', () => import('./_locales/en.json'));
register('pt', () => import('./_locales/pt.json'));
```

See [how to asynchronously load dictionaries](/svelte-i18n/blob/master/docs#22-asynchronous).

#### `waitLocale`

> `import { waitLocale } from 'svelte-i18n'`

`waitLocale(locale: string = $locale): Promise<void>`

Executes the queue of `locale`. If the queue isn't resolved yet, the same promise is returned. Great to use in the `preload` method of Sapper for awaiting [`loaders`](/svelte-i18n/blob/master/docs#22-asynchronous).

**Example**:

```svelte
<script context="module">
  import { register, waitLocale, init } from 'svelte-i18n'

  register('en', () => import('./_locales/en.json'))
  register('pt-BR', () => import('./_locales/pt-BR.json'))
  register('es-ES', () => import('./_locales/es-ES.json'))

  init({ fallbackLocale: 'en' })

  export async function preload() {
    // awaits for 'en' loaders
    return waitLocale()
  }
</script>
```

### Low level API

#### `getDateFormatter`/`getTimeFormatter`/`getNumberFormatter`

> `import { getDateFormatter, getNumberFormatter, getTimeFormatter } from 'svelte-i18n'`

```ts
type FormatterOptions<T> = T & {
  format?: string
  locale?: string // defaults to current locale
}

getDateFormatter(
  options: FormatterOptions<Intl.DateTimeFormatOptions>
): Intl.DateTimeFormat

getTimeFormatter(
  options: FormatterOptions<Intl.DateTimeFormatOptions>
): Intl.DateTimeFormat

getNumberFormatter(
  options: FormatterOptions<Intl.NumberFormatOptions>
): Intl.NumberFormat
```

Each of these methods return their respective [`Intl.xxxxFormatter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects#Internationalization) variant. Click [here](/docs/Formatting.md#accessing-formatters-directly) for an example of usage.

#### `getMessageFormatter`

> `import { getMessageFormatter } from 'svelte-i18n'`

`getMessageFormatter(messageId: string, locale: string): IntlMessageFormat`

Returns an instance of a [`IntlMessageFormat`](https://formatjs.io/docs/intl-messageformat/).
