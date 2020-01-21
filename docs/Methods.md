#### init

> `import { init } from 'svelte-i18n'`

`init(options: InitOptions): void`

Method responsible for configuring some of the library behaviours such as the global fallback and initial locales. Must be called before setting a locale and displaying your view.

```ts
interface InitOptions {
  // the global fallback locale
  fallbackLocale: string
  // set of heuristic configs to define the client's locale
  initialLocale?: InitialLocaleOptions
  // custom time/date/number formats
  formats?: Formats
  // loading delay interval
  loadingDelay?: number
}

interface InitialLocaleOptions {
  // the fallback locale to use if no message is found in the current one
  fallback?: string
  // when 'true', check the 'window.navigator.language' to set the current locale
  navigator?: boolean
  // key to look for a locale on 'window.location.search'
  // 'example.com?locale=en-US'
  search?: string
  // key to look for a locale on 'window.location.hash'
  // 'example.com#locale=en-US'
  hash?: string
  // pattern to look in the window.location.pathname.
  // It returns the first capturing group.
  pathname?: RegExp
  // pattern to look in the window.location.hostname.
  // It returns the first capturing group.
  hostname?: RegExp
}
```

**Example**:

```js
import { init } from 'svelte-i18n'

init({
  // fallback to en if current locale is not in the dictionary
  fallbackLocale: 'en',
  initialLocale: {
    // based on the user's browser
    navigator: true,
  },
})
```

##### Custom formats

It's possible to define custom format styles via the `formats` property if you want to quickly pass a set of options to the underlying `Intl` formatter.

```ts
interface Formats {
  number: Record<string, Intl.NumberFormatOptions>
  date: Record<string, Intl.DateTimeFormatOptions>
  time: Record<string, Intl.DateTimeFormatOptions>
}
```

Please refer to the [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat.md) and [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat.md) documentations to see available formatting options.

**Example**:

```js
import { init } from 'svelte-i18n'

init({
  // fallback to en if current locale is not in the dictionary
  fallbackLocale: 'en',
  formats: {
    number: {
      EUR: { style: 'currency', currency: 'EUR' },
    },
  },
})
```

```html
<div>
  {$_.number(123456.789, { format: 'EUR' })}
</div>
<!-- 123.456,79 € -->
```

#### addMessages

`import { addMessages } from 'svelte-i18n`

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

#### register

> `import { register } from 'svelte-i18n'`

`register(locale: string, loader: () => Promise<object>): void`

Registers an async message `loader` for the specified `locale`. The loader queue is executed when changing to `locale` or when calling `waitLocale(locale)`.

**Example**:

```js
import { register } from 'svelte-i18n'

register('en', () => import('./_locales/en.json'))
register('pt', () => import('./_locales/pt.json'))
```

See [how to asynchronously load dictionaries](/svelte-i18n/blob/master/docs#22-asynchronous).

#### waitLocale

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

#### getDateFormatter / getTimeFormatter / getNumberFormatter

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

Each of these methods return their respective [`Intl.xxxxFormatter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects.md#Internationalization) variant. Click [here](/docs/formatting.md#accessing-formatters-directly) for an example of usage.

#### getMessageFormatter

> `import { getMessageFormatter } from 'svelte-i18n'`

`getMessageFormatter(messageId: string, locale: string): IntlMessageFormat`

Returns an instance of a [`IntlMessageFormat`](https://github.com/formatjs/formatjs/blob/master/packages/intl-messageformat/README.md).
