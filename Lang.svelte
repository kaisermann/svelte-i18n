<script>
  import { locale, loading } from './dist/i18n.mjs'

  $: {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('lang', $locale)
    }
  }
</script>

<slot loading={$loading} locale={$locale} />
