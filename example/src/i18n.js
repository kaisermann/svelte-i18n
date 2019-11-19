import { dictionary } from 'svelte-i18n'

dictionary.set({
  'pt-BR': () => import('../messages/pt-BR.json'),
  'en-US': () => import('../messages/en-US.json'),
  'es-ES': () => import('../messages/es-ES.json'),
})
