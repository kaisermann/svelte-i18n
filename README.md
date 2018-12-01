# svelte-i18n

> Internationalization for Svelte

## Usage

### On the `store`

```js
import i18n from 'svelte-i18n'
import { Store } from 'svelte/store'

/** i18n(svelteStore, { dictionary }) */
let store = new Store()

store = i18n(store, {
  dictionary: {
    'pt-BR': {
      message: 'Mensagem',
      greeting: 'Olá {name}, como vai?',
      greetingIndex: 'Olá {0}, como vai?',
      meter: 'metros | metro | metros',
      book: 'livro | livros',
      messages: {
        alert: 'Alerta',
        error: 'Erro',
      },
    },
    'en-US': {
      message: 'Message',
      greeting: 'Hello {name}, how are you?',
      greetingIndex: 'Hello {0}, how are you?',
      meter: 'meters | meter | meters',
      book: 'book | books',
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

#### Basic usage

```html
<div>
  {$_('message')}: {$_('messages.success'))}
  <!-- Message: SUCCESS-->
</div>
```

#### Current locale

The current locale is available via `this.store.get().locale`.

#### Interpolation

```html
<div>
  <!-- Named interpolation -->
  {$_('greeting', { name: 'John' }))}
  <!-- Hello John, how are you?-->

  <!-- List interpolation -->
  {$_('greetingIndex', ['John']))}
  <!-- Hello John, how are you?-->
</div>
```

#### Pluralization

```html
<div>
  0 {$_.plural('meter', 0))}
  <!-- 0 meters -->

  1 {$_.plural('meter', 1))}
  <!-- 1 meter -->

  100 {$_.plural('meter', 100))}
  <!-- 100 meters -->

  0 {$_.plural('book', 0))}
  <!-- 0 books -->

  1 {$_.plural('book', 1))}
  <!-- 1 book -->

  10 {$_.plural('book', 10))}
  <!-- 10 books -->
</div>
```

#### Utilities

```html
<div>
  {$_.upper('message'))}
  <!-- MESSAGE -->

  {$_.lower('message'))}
  <!-- message -->

  {$_.capital('message'))}
  <!-- Message -->

  {$_.title('greeting', { name: 'John' }))}
  <!-- Hello John, How Are You?-->
</div>
```
