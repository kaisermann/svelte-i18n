<script>
  import { locale, _ } from 'svelte-i18n'

  let subtitle = $_('page.subtitle', { default: 'foo' })
</script>

<h1>{$_.title('page.title', { default: 'Title' })}</h1>
<h2>{subtitle}</h2>
