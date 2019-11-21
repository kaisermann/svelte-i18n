<script context="module">
  import { register, waitLocale } from 'svelte-i18n'

  register('en', () => import('./_locales/en.json'))
  register('pt-BR', () => import('./_locales/pt-BR.json'))
  register('es-ES', () => import('./_locales/es-ES.json'))

  export async function preload(page, session) {
    return waitLocale()
  }
</script>

<script>
  import { _ } from 'svelte-i18n'
</script>

<svelte:head>
  <title>{$_('title.about')}</title>
</svelte:head>

<h1>{$_('about_this_site')}</h1>

<p>{$_('about_content[0]')}</p>
