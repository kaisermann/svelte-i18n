# svelte-i18n

> Internationalization for svelte

**Work-in-progress**

## Usage

### On the `store`

```js
import i18n from 'svelte-i18n'
import { Store } from 'svelte/store'

/** i18n(svelteStore, { dictionary }) */
const store = i18n(new Store(), {
  dictionary: {
    'pt-BR': {
      message: 'Mensagem',
      messages: {
        alert: 'Alerta',
        error: 'Erro',
      },
    },
    'en-US': {
      message: 'Message',
      messages: {
        alert: 'Alert',
        error: 'Error',
      },
    },
  },
})

/**
 * Extend the initial dictionary.
 * Dictionaries are deeply merged.
 * */
store.i18n.extendDictionary({
  'pt-BR': {
    messages: {
      warn: 'Aviso',
      success: 'Sucesso',
    },
  },
  'en-US': {
    messages: {
      warn: 'Warn',
      success: 'Success',
    },
  },
})

/** Set the initial locale */
store.i18n.setLocale('en-US')
```

### On `templates`

```html
<div>
  {$_('message')}: {$_.upper('messages.success'))}
</div>
```

Renders:

```html
Message: SUCCESS
```
