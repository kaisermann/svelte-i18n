<script context="module">
  import { locale, locales, getClientLocale } from 'svelte-i18n'

  export async function preload() {
    return locale.set(getClientLocale({ default: 'en-US', navigator: true }))
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

<Nav {segment} />

<main>
  <select bind:value={$locale}>
    {#each $locales as locale}
      <option value={locale}>{localeLabels[locale]}</option>
    {/each}
  </select>
  <slot />
</main>
