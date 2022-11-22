<script lang="ts">
  import { _ } from 'svelte-i18n';

  const name: string = 'John';
</script>

<h1>{$_('home.page.title')}</h1>
<h2>{$_({ id: 'home.page.subtitle' })}</h2>
<ul>
  <li>{$_('list.0')}</li>
  <li>{$_('list.1')}</li>
  <li>{$_('list.2')}</li>
</ul>
