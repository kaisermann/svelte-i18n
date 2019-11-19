<script>
  import { locale } from './dist/i18n.mjs'

  let loading = false

  $: {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('lang', $locale)
    }
  }
</script>

<slot {loading} />