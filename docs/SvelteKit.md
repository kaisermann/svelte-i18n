# Usage in Svelte Kit

> The solution is *heavily* inspired by https://github.com/sveltekit-i18n/lib/issues/94#issuecomment-1247942697.
>
> All kudos to @jonsaw.
> This is merely an adaptation to `svelte-i18n`.

- Support for SSR
- Example with user preference set by [`Accept-Language`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language) on the server and [`navigator.language`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/languages) on the frontend.

## 1. Setup svelte-i18n

The first thing we need to do is to setup regular `svelte-i18n`.

```typescript
// src/lib/i18n/index.ts
import { browser } from '$app/environment'
import { init, register } from 'svelte-i18n'

const defaultLocale = 'en'

register('en', () => import('./locales/en.json'))
register('de', () => import('./locales/de.json'))

init({
	fallbackLocale: defaultLocale,
	initialLocale: browser ? window.navigator.language : defaultLocale,
})
```

## 2. Setup the hook

For SSR we need to tell the the server what language is being used. This could use cookies or the accept-language header for example.
The easiest way to set the locale in the [server hook](https://kit.svelte.dev/docs/hooks#server-hooks)

```typescript
// hooks.server.ts
import type { Handle } from '@sveltejs/kit'
import { locale } from 'svelte-i18n'

export const handle: Handle = async ({ event, resolve }) => {
	const lang = event.request.headers.get('accept-language')?.split(',')[0]
	if (lang) {
		locale.set(lang)
	}
	return resolve(event)
}
```

## 3. Setup the layout

On the frontend we need to set the language too, for this we could again use cookies, or in this example: `window.navigator.language`.


```typescript
// +layout.ts
import { browser } from '$app/environment'
import '$lib/i18n' // Import to initialize. Important :)
import { locale, waitLocale } from 'svelte-i18n'
import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async () => {
	if (browser) {
		locale.set(window.navigator.language)
	}
	await waitLocale()
}
```

```svelte
<!-- +layout.svelte -->
<slot />
```

# 4. Use the library as normal

```svelte
<script lang="ts">
	import { _ } from 'svelte-i18n'
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

{$_('my.translation.key')}
```
