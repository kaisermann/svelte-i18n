<script>
  import { locale, _ } from '../../src/index.js'

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

<h1>{$_.title('greeting.message', { values: { name } })}</h1>

<br />
<input type="range" min="0" max="5" step="1" bind:value={pluralN} />
<h2>Plural: {$_('photos', { values: { n: pluralN } })}</h2>

<br />
<input type="range" min="100" max="100000000" step="10000" bind:value={catsN} />
<h2>Number: {$_('cats', { values: { n: catsN } })}</h2>

<br />
<h2>Number util: {$_.number(catsN)}</h2>
<h2>Number util: {$_.number(10000000, { format: 'compactShort' })}</h2>

<br />
<h2>Date util: {$_.date(date, 'short')}</h2>

<br />
<h2>Time util: {$_.time(date, 'medium')}</h2>

<br />
<button on:click={() => locale.set(oppositeLocale)}>
  {$_('switch.lang', { locale: oppositeLocale })}
</button>
