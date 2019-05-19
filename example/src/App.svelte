<script>
  import { locale, _ } from 'svelte-i18n'

  let name = ''
  let pluralN = 2
  let catsN = 992301
  let date = new Date()

  $: oppositeLocale = $locale === 'pt' ? 'en' : 'pt'

  setInterval(() => {
    date = new Date()
  }, 1000)
</script>

<input
  class="w-100"
  type="text"
  placeholder={$_('greeting.ask')}
  bind:value={name} />
<br />

<h1>{$_.title('greeting.message', { name })}</h1>

<br />
<input type="range" min="0" max="5" step="1" bind:value={pluralN} />
<h2>Plural: {$_('photos', { n: pluralN })}</h2>

<br />
<input type="range" min="100" max="100000000" step="10000" bind:value={catsN} />
<h2>Number: {$_('cats', { n: catsN })}</h2>

<br />
<h2>Number util: {$_.number(catsN)}</h2>

<br />
<h2>Date util: {$_.date(date, 'short')}</h2>

<br />
<h2>Time util: {$_.time(date, 'medium')}</h2>

<br />
<button on:click={() => locale.set(oppositeLocale)}>
   {$_('switch.lang', null, oppositeLocale)}
</button>
