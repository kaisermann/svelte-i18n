<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [From `v2` to `v3`](#from-v2-to-v3)
  - [Formatting numbers, dates and times](#formatting-numbers-dates-and-times)
  - [Casing utilities](#casing-utilities)
  - [Getting the client locale](#getting-the-client-locale)
- [From `v1` to `v2`](#from-v1-to-v2)
  - [Adding dictionaries](#adding-dictionaries)
  - [Setting the initial and fallback locales](#setting-the-initial-and-fallback-locales)
  - [Interpolating values](#interpolating-values)
  - [Adding custom formats](#adding-custom-formats)

<!-- /code_chunk_output -->

#### From `v2` to `v3`

##### Formatting numbers, dates and times

In `v2`, to format numbers, dates and times you would access the `date`, `time` or `number` method of the main formatter method:

```js
$_.time(dateValue)
$_.date(dateValue)
$_.number(100000000)
```

In `v3`, these utilities are exported as standalone formatter stores, making them tree-shakeable:

```js
import { time, date, number } from 'svelte-i18n'

$time(someDateValue)
$date(someDateValue)
$number(100000000)
```

##### Casing utilities

The casing utilities `$_.title`, `$_.capital`, `$_.lower`, `$_.upper` were removed from the library.

In `v2`:

```js
$_.lower('message.id')
$_.upper('message.id')
$_.title('message.id')
$_.capital('message.id')
```

In `v3`:

```js
function capital(str: string) {
  return str.replace(/(^|\s)\S/, l => l.toLocaleUpperCase())
}

function title(str: string) {
  return str.replace(/(^|\s)\S/g, l => l.toLocaleUpperCase())
}

$_('message.id').toLocaleLowerCase()
$_('message.id').toLocaleUpperCase()
title($_('message.id'))
capital($_('message.id'))
```

##### Getting the client locale

In `v2`, the [`init`](/docs/Methods.md#init) method could automatically set the initial locale based on some heuristcs from the client:

```js
import { init } from 'svelte-i18n'

init({
  initialLocale: {
    navigator: true,
  },
})
```

However, many people didn't need that kind of extra weight in their apps. So in `v3` you have to explicitly import the utility desired:

- [`getLocaleFromHostname`](/docs/Methods.md#getlocalefromhostname)
- [`getLocaleFromPathname`](/docs/Methods.md#getlocalefrompathname)
- [`getLocaleFromNavigator`](/docs/Methods.md#getlocalefromnavigator)
- [`getLocaleFromQueryString`](/docs/Methods.md#getlocalefromquerystring)
- [`getLocaleFromHash`](/docs/Methods.md#getlocalefromhash)

```js
import { init, getLocaleFromNavigator } from 'svelte-i18n'

init({
  initialLocale: getLocaleFromNavigator(),
})
```

#### From `v1` to `v2`

##### Adding dictionaries

In `v1`, dictionaries were added through the store API of `$dictionary`.

```js
import { dictionary } from 'svelte-i18n'

dictionary.set({
  en: { ... },
  pt: { ... },
})

dictionary.update(d => {
  d.fr = { ... }
  return d
})
```

In `v2`, you can use [`addMessages(locale, messages)`](/docs/Methods.md#addmessages) to add new messages to the main dictionary.

```js
import { addMessages } from 'svelte-i18n'

addMessages('en', { ... })
addMessages('pt', { ... })
addMessages('fr', { ... })

// message dictionaries are merged together
addMessages('en', { ... })
```

_It's also possible to asynchronously load your locale dictionary, see [register()](/docs/Methods.md#register)._

##### Setting the initial and fallback locales

In `v1`, to set the initial and fallback locales you could use `getClientLocale()` together with `$locale = ...` or `locale.set(...)`.

```js
import { getClientLocale, locale } from 'svelte-i18n'

locale.set(
  getClientLocale({
    fallback: 'en',
    navigator: true,
  })
)
```

In `v2`, both locales can be defined very similarly with [`init()`](/docs/Methods.md#init).

```js
import { init } from 'svelte-i18n'

init({
  fallbackLocale: 'en',
  initialLocale: {
    navigator: true,
  },
})
```

##### Interpolating values

In `v1`, interpolated values were the whole object passed as the second argument of the `$format` method.

```svelte
<h1>
  {$_('navigation.pagination', { current: 2, max: 10 })}
</h1>
<!-- Page: 2/10 -->
```

In `v2`, the interpolated values are passed in the `values` property.

```svelte
<h1>
  {$_('navigation.pagination', { values: { current: 2, max: 10 }})}
</h1>
<!-- Page: 2/10 -->
```

##### Adding custom formats

In `v1`, custom formats could be added with `addCustomFormats()`.

```js
import { addCustomFormats } from 'svelte-i18n'

addCustomFormats({
  number: {
    EUR: { style: 'currency', currency: 'EUR' },
  },
})
```

In `v2`, custom formats are added through [`init()`](/docs/Methods.md#init).

```js
import { init } from 'svelte-i18n'

init({
  fallbackLocale: ...,
  initialLocale, ...,
  formats:{
    number: {
      EUR: { style: 'currency', currency: 'EUR' },
    },
  }
})
```
