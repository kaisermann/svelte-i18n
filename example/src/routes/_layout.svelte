<script context="module">
  import { isLoading, waitLocale } from 'svelte-i18n'

  export async function preload() {
    return waitLocale()
  }
</script>

<script>
  import Nav from '../components/Nav.svelte'

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

{#if $isLoading}
  <div class="loading">Loading...</div>
{/if}

<Nav {segment} />

<main>
  <slot />
</main>
