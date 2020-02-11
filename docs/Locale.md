`import { locale } from 'svelte-i18n'`

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

### `$locale`

The `locale` store defines what is the current locale. When its value is changed, before updating the actual stored value, `svelte-i18n` sees if there's any message loaders registered for the new locale:

- If yes, changing the `locale` is an async operation.
- If no, the locale's dictionary is fully loaded and changing the locale is a sync operation.

The `<html lang>` attribute is automatically updated to the current locale.

#### Usage on component

To change the locale inside a component is as simple as assinging it a new value.

```svelte
<script>
  import { locale, locales } from 'svelte-i18n'
</script>

<select bind:value={$locale}>
  {#each $locales as locale}
    <option value={locale}>{locale}</option>
  {/each}
</select>

```

#### Usage on regular script

```js
import { locale } from 'svelte-i18n'

// Set the current locale to en-US
locale.set('en-US')

// This is a store, so we can subscribe to its changes
locale.subscribe(() => console.log('locale change'))
```

### `$isLoading`

While changing the `$locale`, the `$isLoading` store can be used to detect if the app is currently fetching any enqueued message definitions.

```svelte
<script>
  import { isLoading } from 'svelte-i18n'
</script>

{#if $isLoading}
  Please wait...
{:else}
  <Nav />
  <Main />
{/if}
```

> `$isLoading` will only be `true` if fetching takes more than 200ms.
