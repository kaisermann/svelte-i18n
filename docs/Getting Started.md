### Getting started

#### 1. Locale dictionaries

A locale dictionary is a regular JSON object which contains message definitions for a certain language.

```jsonc
// en.json
{
  "page_title": "Page titlte",
  "sign_in": "Sign in",
  "sign_up": "Sign up",
}

// pt.json
{
  "page_title": "Título da página",
  "sign_in": "Entrar",
  "sign_up": "Registrar",
}
```

#### 2. Adding locale dictionaries

There are two different ways of adding a new dicitonary of messages to a certain locale:

##### 2.1 Synchronous

Just `import`/`require` your locale `.json` files and pass them to the [`addMessages(locale, dict)`](/docs/Methods.md#addmessage) method.

```js
// src/i18n.js
import { addMessages } from 'svelte-i18n'

import en from './en.json'
import enUS from './en-US.json'
import pt from './pt.json'

addMessages('en', en)
addMessages('en-US', enUS)
addMessages('pt', pt)

// en, en-US and pt are available
```

##### 2.2 Asynchronous

A more performant way to load your dictionaries is to register `loader` methods. This way, only the files registered to the current locale will be loaded. A `loader` is a method which must return a `Promise` that resolves to a `JSON` object. A [`$locale`](/kaisermann/svelte-i18n/Locale) value change will automatically load the registered loaders for the new locale.

```js
// src/i18n.js
import { register } from 'svelte-i18n'

register('en', () => import('./en.json'))
register('en-US', () => import('./en-US.json'))
register('pt', () => import('./pt.json'))

// en, en-US and pt are not available yet
```

#### 3. Initializing

After populating your [`$dictionary`](/docs/Dictionary.md) with [`addMessages()`](/docs/Methods.md#addmessages) or registering loaders via [`register()`](/docs/Methods.md#register), you are ready to bootstrap the library. You can use [`init()`](/docs/Methods.md#init) to define the fallback locale, initial locale and other options of your app.

```js
// src/i18n.js
import { register, init } from 'svelte-i18n'

register('en', () => import('./en.json'))
register('en-US', () => import('./en-US.json'))
register('pt', () => import('./pt.json'))
// en, en-US and pt are not available yet

init({
  fallbackLocale: 'en',
  initialLocale: {
    navigator: true, // i.e 'en-US'
  },
})
// starts loading 'en-US' and 'en'
```

_**Note**: If you're using Sapper, remember to also call `init()` on your server side code (`server.js`)._

Since we're using `register`, and not `addMessages`, we need to wait for it's loaders to finish before rendering your app.

In **Svelte**, the [`$isLoading`](/docs/Locale.md#loading) store can help to only show your app after the initial load as shown in [Locale](/docs/Locale.md#loading).

In **Sapper**, you can use the `preload` static method together with `waitLocale`:

```svelte
<!-- src/_layout.svelte -->
<script context="module">
  import { waitLocale } from 'svelte-i18n'

  export async function preload() {
    // awaits for the loading of the 'en-US' and 'en' dictionaries
    return waitLocale()
  }
</script>
```

Please note that the `fallbackLocale` is always loaded, independent of the current locale, since only some messages can be missing.

#### 4. Localizing your app

After having the initial locale set, you're ready to start localizing your app. Import the [`$format`](/docs/Formatting.md) method, or any of its aliases, to any component that needs to be translated. Then, just call [`$format`](/docs/Formatting.md) passing the message `id` on your layout and voila! 🎉

```svelte
<script>
  import { _ } from 'svelte-i18n'
</script>

<svelte:head>
  <title>{$_.upper('page_title')}</title>
</svelte:head>

<nav>
  <a>{$_('sign_in')}</a>
  <a>{$_('sign_up')}</a>
</nav>
```

See [Formatting](/docs/Formatting.md) to read about the supported message syntax.
