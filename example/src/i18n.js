import { register, configure } from 'svelte-i18n'

configure({
  fallbackLocale: 'en',
  initialLocale: {
    navigator: true,
  },
  formats: {
    number: {
      BRL: { style: 'currency', currency: 'BRL' },
    },
  },
  loadingDelay: 200,
})

register('en', () => import('../messages/en.json'))
register('pt-BR', () => import('../messages/pt-BR.json'))
register('es-ES', () => import('../messages/es-ES.json'))
