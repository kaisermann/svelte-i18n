<script context="module">
  import { locale, locales, getClientLocale, waitLocale } from 'svelte-i18n'
  import Lang from 'svelte-i18n/Lang.svelte'

  export async function preload() {
    return locale.set(getClientLocale({ default: 'pt-BR', navigator: true }))
  }
</script>

<script>
  import Nav from '../components/Nav.svelte'

  const localeLabels = {
    'pt-BR': 'Português',
    'en-US': 'English',
    'es-ES': 'Espanõl',
  }

  export let segment
</script>

<style>
  main {
    position: relative;
    max-width: 56em;
    background-color: white;
    padding: 2em;
    margin: 0 auto;
    box-sizing: border-box;
  }
</style>

<Lang let:loading>{loading}</Lang>

<Nav {segment} />

<main>
  <select bind:value={$locale}>
    {#each $locales as locale}
      {#if locale in localeLabels}
        <option value={locale}>{localeLabels[locale]}</option>
      {/if}
    {/each}
  </select>
  <slot />
</main>
