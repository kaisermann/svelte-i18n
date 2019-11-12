import {
  locale,
  dictionary,
  getClientLocale,
  addCustomFormats,
} from '../../src/index.js'

addCustomFormats({
  number: {
    compact: {
      notation: 'compact',
      compactDisplay: 'long',
    },
  },
})

// defining a locale dictionary
dictionary.set({
  pt: {
    'switch.lang': 'Trocar idioma',
    greeting: {
      ask: 'Por favor, digite seu nome',
      message: 'Olá {name}, como vai?',
    },
    photos:
      'Você {n, plural, =0 {não tem fotos.} =1 {tem uma foto.} other {tem # fotos.}}',
    cats: 'Tenho {n, number} {n,plural,=0{gatos}one{gato}other{gatos}}',
  },
  en: {
    'switch.lang': 'Switch language',
    greeting: {
      ask: 'Please type your name',
      message: 'Hello {name}, how are you?',
    },
    photos:
      'You have {n, plural, =0 {no photos.} =1 {one photo.} other {# photos.}}',
    cats: 'I have {n, number} {n,plural,one{cat}other{cats}}',
  },
})

locale.set(
  getClientLocale({
    navigator: true,
    hash: 'lang',
    fallback: 'pt',
  }),
)

locale.subscribe(l => {
  console.log('locale change', l)
})
