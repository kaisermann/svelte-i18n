<script context="module">
  import { locales, locale, waitInitialLocale } from 'svelte-i18n'
  import Intl from 'svelte-i18n/Intl.svelte'

  export async function preload() {
    return waitInitialLocale({
      default: 'en-US',
      navigator: true,
    })
  }
</script>

<script>
  import Nav from '../components/Nav.svelte'

  const localeLabels = {
    'pt-BR': 'Português',
    en: 'English',
    'en-US': 'English US',
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

  .loading {
    position: fixed;
    z-index: 10;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;
    font-family: monospace;
    font-size: 4rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>

<Intl let:isLoading>
  {#if isLoading}
    <div class="loading">Loading...</div>
  {/if}

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
</Intl>
