<script context="module">
  function updateLangAttr(lang) {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('lang', lang)
    }
  }
</script>

<script>
  import { locale, locales, loading } from './dist/i18n.mjs'

  $: updateLangAttr($locale)
</script>

<slot loading={$loading} locale={$locale} locales={$locales} />
