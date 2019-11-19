# svelte-i18n

> Internationalization for Svelte.

<!-- [See Demo](https://svelte-i18n.netlify.com/) -->

<!-- @import "[TOC]" {cmd="toc" depthFrom=2 depthTo=3 orderedList=false} -->

<!-- code_chunk_output -->

- [Usage](#usage)
  - [Locale](#locale)
  - [The dictionary](#the-dictionary)
  - [Formatting](#formatting)
  - [Formatting methods](#formatting-methods)
  - [Formats](#formats)
- [CLI](#cli)
  - [Options](#options)

<!-- /code_chunk_output -->

## Usage

`svelte-i18n` uses `stores` to keep track of the current locale, dictionary of messages and the main format function. This way, we keep everything neat, in sync and easy to use on your svelte files.

---

### Locale

The `locale` store defines what is the current locale.

```js
import { locale, dictionary, getClientLocale } from 'svelte-i18n'

// Set the current locale to en-US
locale.set('en-US')

// This is a store, so we can subscribe to its changes
locale.subscribe(() => console.log('locale change'))

// svelte-i18n exports a method to help getting the current client locale
locale.set(
  getClientLocale({
    // the fallback locale, if didn't find any
    fallback: 'en-US',
    // set to 'true' to check the 'window.navigator.language'
    navigator: true,
    // set the key name to look for a locale on 'window.location.search'
    // 'example.com?locale=en-US'
    search: 'lang',
    // set the key name to look for a locale on 'window.location.hash'
    // 'example.com#locale=en-US'
    hash: 'locale',
  }),
)
```

If a locale with the format `xx-YY` is not found, `svelte-i18n` looks for the locale `xx` as well.

---

### The dictionary

The `dictionary` store defines the dictionary of messages of all locales.

```js
import { locale, dictionary } from 'svelte-i18n'

// Define a locale dictionary
dictionary.set({
  pt: {
    message: 'Mensagem',
    'switch.lang': 'Trocar idioma',
    greeting: {
      ask: 'Por favor, digite seu nome',
      message: 'Olá {name}, como vai?',
    },
    photos:
      'Você {n, plural, =0 {não tem fotos.} =1 {tem uma foto.} other {tem # fotos.}}',
    cats: 'Tenho {n, number} {n,plural,=0{gatos}one{gato}other{gatos}}',
  },
  en: {
    message: 'Message',
    'switch.lang': 'Switch language',
    greeting: {
      ask: 'Please type your name',
      message: 'Hello {name}, how are you?',
    },
    photos:
      'You have {n, plural, =0 {no photos.} =1 {one photo.} other {# photos.}}',
    cats: 'I have {n, number} {n,plural,one{cat}other{cats}}',
  },
})

// It's also possible to merge the current dictionary
// with other objets
dictionary.update(dict => {
  dict.fr = {
    // ...french messages
  }
  return dict
})
```

Each language message dictionary can be as deep as you want. Messages can also be looked up by a string represetation of it's path on the dictionary (i.e `greeting.message`).

---

### Formatting

The `_`/`format` store is the actual formatter method. To use it it's simple as any other svelte store.

```html
<script>
  // locale is en
  import { _ } from 'svelte-i18n'
</script>

<input placeholder="{$_('greeting.ask')}" />
```

`svelte-i18n` uses `formatjs` behind the scenes, which means it supports the [ICU message format](http://userguide.icu-project.org/formatparse/messages) for interpolation, pluralization and much more.

```html
<div>
  {$_('greeting.message', { values: { name: 'John' }})}
  <!-- Hello John, how are you? -->

  {$_('photos', { values: { n: 0 }})}
  <!-- You have no photos. -->

  {$_('photos', { values: { n: 12} })}
  <!-- You have 12 photos. -->
</div>
```

### Formatting methods

#### `_` / `format`

Main formatting method that formats a localized message by its `id`.

```ts
function(messageId: string, options?: MessageObject): string
function(options: MessageObject): string

interface MessageObject {
  id?: string
  locale?: string
  format?: string
  default?: string
  values?: Record<string, string | number | Date>
}
```

- `id`: represents the path to a specific message;
- `locale`: forces a specific locale;
- `default`: the default value in case of message not found in the current locale;
- `format`: the format to be used. See [#formats](#formats);
- `values`: properties that should be interpolated in the message;

You can pass a `string` as the first parameter for a less verbose way of formatting a message.

```html
<script>
  import { _ } from 'svelte-i18n'
</script>

<div>{$_('greeting.ask')}</div>
<!-- Please type your name -->

<div>{$_({ id: 'greeting.ask' })}</div>
<!-- Please type your name -->
```

The formatter method also provides some casing utilities:

- `_.upper` - transforms a localized message into uppercase;
- `_.lower` - transforms a localized message into lowercase;
- `_.capital` - capitalize a localized message;
- `_.title` - transforms the message into title case;

```html
<div>{$_.upper('greeting.ask')}</div>
<!-- PLEASE TYPE YOUR NAME -->

<div>{$_.lower('greeting.ask')}</div>
<!-- please type your name -->

<div>{$_.capital('greeting.ask')}</div>
<!-- Please type your name -->

<div>{$_.title('greeting.ask')}</div>
<!-- Please Type Your Name -->
```

#### `_.time`

Formats a date object into a time string with the specified format (`short`, `medium`, `long`, `full`). Please refer to the [#formats](#formats) section to see available formats.

```ts
function(time: Date, options: MessageObject): string
```

```html
<div>{$_.time(new Date(2019, 3, 24, 23, 45))}</div>
<!-- 11:45 PM -->

<div>{$_.time(new Date(2019, 3, 24, 23, 45), { format: 'medium' } )}</div>
<!-- 11:45:00 PM -->
```

#### `_.date`

Formats a date object into a string with the specified format (`short`, `medium`, `long`, `full`). Please refer to the [#formats](#formats) section to see available formats.

```ts
function(date: Date, options: MessageObject): string
```

```html
<div>{$_.date(new Date(2019, 3, 24, 23, 45))}</div>
<!-- 4/24/19 -->

<div>{$_.date(new Date(2019, 3, 24, 23, 45), { format: 'medium' } )}</div>
<!-- Apr 24, 2019 -->
```

#### `_.number`

Formats a number with the specified locale and format. Please refer to the [#formats](#formats) section to see available formats.

```ts
function(number: number, options: MessageObject): string
```

```html
<div>{$_.number(100000000)}</div>
<!-- 100,000,000 -->

<div>{$_.number(100000000, { locale: 'pt' })}</div>
<!-- 100.000.000 -->
```

### Formats

`svelte-i18n` comes with a set of default `number`, `time` and `date` formats:

**Number:**

- `currency`: `{ style: 'currency' }`
- `percent`: `{ style: 'percent' }`
- `scientific`: `{ notation: 'scientific' }`
- `engineering`: `{ notation: 'engineering' }`
- `compactLong`: `{ notation: 'compact', compactDisplay: 'long' }`
- `compactShort`: `{ notation: 'compact', compactDisplay: 'short' }`

**Date:**

- `short`: `{ month: 'numeric', day: 'numeric', year: '2-digit' }`
- `medium`: `{ month: 'short', day: 'numeric', year: 'numeric' }`
- `long`: `{ month: 'long', day: 'numeric', year: 'numeric' }`
- `full`: `{ weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }`

**Time:**

- `short`: `{ hour: 'numeric', minute: 'numeric' }`
- `medium`: `{ hour: 'numeric', minute: 'numeric', second: 'numeric' }`
- `long`: `{ hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short' }`
- `full`: `{ hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short' }`

It's possible to define custom format styles via the `addCustomFormats` method if you need to supply a set of options to the underlying `Intl` formatter.

```ts
function addCustomFormats(formatsObject: Formats): void

interface Formats {
  number: Record<string, Intl.NumberFormatOptions>
  date: Record<string, Intl.DateTimeFormatOptions>
  time: Record<string, Intl.DateTimeFormatOptions>
}
```

Please refer to the [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat) and [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat) documentations to see available formatting options.

**Example**:

```js
import { addCustomFormats } from 'svelte-i18n'

addCustomFormats({
  number: {
    EUR: {
      style: 'currency',
      currency: 'EUR',
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

## CLI

`svelte-i18n` provides a command-line interface to extract all your messages to the `stdout` or to a specific JSON file.

```bash
$ svelte-i18n extract [options] <glob-pattern> [output-file]
```

### Options

- `-s, --shallow` - extract all messages to a shallow object, without creating nested objects. Default: `false`.

- `--overwrite` - overwrite the content of the `output` file instead of just appending missing properties. Default: `false`.

- `-c, --configDir` - define the directory of a [`svelte.config.js`](https://github.com/UnwrittenFun/svelte-vscode#generic-setup) in case your svelte components need to be preprocessed.
