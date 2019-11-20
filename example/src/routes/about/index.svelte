<script context="module">
  import { register, waitLocale } from 'svelte-i18n'

  register('en-US', () => import('./_locales/en-US.json'))
  register('pt-BR', () => import('./_locales/pt-BR.json'))
  register('es-ES', () => import('./_locales/es-ES.json'))

  export async function preload() {
    return waitLocale()
  }
</script>

<script>
  import { _ } from 'svelte-i18n'
</script>

<svelte:head>
  <title>{$_('title.about', { default: 'About' })}</title>
</svelte:head>

<h1>{$_('about_this_site', { default: 'About this site' })}</h1>

<p>{$_('about_content[0]', { default: "This is the 'about' page. There's not much here." })}</p>
