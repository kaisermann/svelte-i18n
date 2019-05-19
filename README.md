# svelte-i18n

> Internationalization for Svelte.

[See Demo](https://svelte-i18n.netlify.com/)

## Usage

`svelte-i18n` utilizes svelte `stores` for keeping track of the current locale, dictionary of messages and the main format function. This way, we keep everything neat, in sync and easy to use on your svelte files.

---

### Locale

The `locale` store defines what is the current locale.

```js
import { locale, dictionary } from 'svelte-i18n'

// Set the current locale to en-US
locale.set('en-US')

// This is a store, so we can subscribe to its changes
locale.subscribe(() => {
  console.log('locale change')
})
```

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

The `_`/`format` store is the actual formatter method. To use it, it's simple as any other svelte store.

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
  {$_('greeting.message', { name: 'John' })}
  <!-- Hello John, how are you? -->

  {$_('photos', { n: 0 })}
  <!-- You have no photos. -->

  {$_('photos', { n: 12 })}
  <!-- You have 12 photos. -->
</div>
```

### Formatting methods

#### `_` / `format`

`function(messageId: string, locale:? string): string`

`function(messageId: string, interpolations?: object, locale:? string): string`

Main formatting method that formats a localized message by its id.

```html
<script>
  import { _ } from 'svelte-i18n'
</script>

<div>{$_('greeting.ask')}</div>
<!-- Please type your name -->
```

#### `_.upper`

Transforms a localized message into uppercase.

```html
<script>
  import { _ } from 'svelte-i18n'
</script>

<div>{$_.upper('greeting.ask')}</div>
<!-- PLEASE TYPE YOUR NAME -->
```

#### `_.lower`

Transforms a localized message into lowercase.

```html
<script>
  import { _ } from 'svelte-i18n'
</script>

<div>{$_.lower('greeting.ask')}</div>
<!-- PLEASE TYPE YOUR NAME -->
```

#### `_.capital`

Capitalize a localized message.

```html
<script>
  import { _ } from 'svelte-i18n'
</script>

<div>{$_.capital('greeting.ask')}</div>
<!-- Please type your name -->
```

#### `_.title`

Transform the message into title case.

```html
<script>
  import { _ } from 'svelte-i18n'
</script>

<div>{$_.capital('greeting.ask')}</div>
<!-- Please Type Your Name -->
```

#### `_.time`

`function(time: Date, format?: string, locale?: string)`

Formats a date object into a time string with the specified format (`short`, `medium`, `long`, `full`). Please refer to the [ICU message format](http://userguide.icu-project.org/formatparse/messages) documentation for all available. formats

```html
<script>
  import { _ } from 'svelte-i18n'
</script>

<div>{$_.time(new Date(2019, 3, 24, 23, 45))}</div>
<!-- 11:45 PM -->

<div>{$_.time(new Date(2019, 3, 24, 23, 45), 'medium')}</div>
<!-- 11:45:00 PM -->
```

#### `_.date`

`function(date: Date, format?: string, locale?: string)`

Formats a date object into a string with the specified format (`short`, `medium`, `long`, `full`). Please refer to the [ICU message format](http://userguide.icu-project.org/formatparse/messages) documentation for all available. formats

```html
<script>
  import { _ } from 'svelte-i18n'
</script>

<div>{$_.date(new Date(2019, 3, 24, 23, 45))}</div>
<!-- 4/24/19 -->

<div>{$_.date(new Date(2019, 3, 24, 23, 45), 'medium')}</div>
<!-- Apr 24, 2019 -->
```

#### `_.number`

`function(number: Number, locale?: string)`

Formats a number with the specified locale

```html
<script>
  import { _ } from 'svelte-i18n'
</script>

<div>{$_.number(100000000)}</div>
<!-- 100,000,000 -->

<div>{$_.number(100000000, 'pt')}</div>
<!-- 100.000.000 -->
```
