# svelte-i18n

> Internationalization for svelte

**Work-in-progress**

## Usage

### On the `store`

```js
import i18n from 'svelte-i18n'
import { Store } from 'svelte/store'

const store = new Store()

/** i18n(svelteStore, arrayOfLocalesObjects) */
i18n(store, [
  {
    'pt-BR': {
      message: 'Mensagem',
      messages: {
        alert: 'Alerta',
        error: 'Erro'
      }
    },
    'en-US': {
      message: 'Message',
      messages: {
        alert: 'Alert',
        error: 'Error'
      }
    }
  },
  /** Locales are deeply merged */
  {
    'pt-BR': {
      messages: {
        warn: 'Aviso',
        success: 'Sucesso'
      }
    },
    'en-US': {
      messages: {
        warn: 'Warn',
        success: 'Success'
      }
    }
  }
])
```

### On `templates`

```html

<div>
  {$_('message')}: {upper($_('messages.success'))}
</div>

<script>
  import { upper } from 'svelte-i18n';
  export default {
    helpers: {
      upper,
    }
  }
</script>
```

Renders:

```html
Message: SUCCESS
```