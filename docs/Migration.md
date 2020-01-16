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
