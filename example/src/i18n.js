import { registerLocaleLoader } from 'svelte-i18n'

registerLocaleLoader('en', () => import('../messages/en.json'))
registerLocaleLoader('pt-BR', () => import('../messages/pt-BR.json'))
registerLocaleLoader('en-US', () => import('../messages/en-US.json'))
registerLocaleLoader('es-ES', () => import('../messages/es-ES.json'))
