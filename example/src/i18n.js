import { register } from 'svelte-i18n'

register('en', () => import('../messages/en.json'))
register('pt-BR', () => import('../messages/pt-BR.json'))
register('en-US', () => import('../messages/en-US.json'))
register('es-ES', () => import('../messages/es-ES.json'))
