<script context="module">
  function updateLangAttr(lang) {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('lang', lang)
    }
  }
</script>

<script>
  import { locale, locales, isLoading } from './dist/i18n.mjs'

  $: updateLangAttr($locale)
</script>

<slot isLoading={$isLoading} locale={$locale} locales={$locales} />
