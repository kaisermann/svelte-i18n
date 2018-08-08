// TODO: A more serious test

import { i18n } from '../src/index'
import { Store } from 'svelte/store.umd'
import { capital, title, upper, lower, isObject, warn } from '../src/utils'

const store = new Store()
const locales = {
  'pt-br': {
    test: 'teste',
    phrase: 'adoro banana',
    phrases: ['Frase 1', 'Frase 2'],
    pluralization: 'Zero | Um | Muito!',
    interpolation: {
      key: 'Olá, {0}! Como está {1}?',
      named: 'Olá, {name}! Como está {time}?',
    },
    wow: {
      much: {
        deep: {
          list: ['Muito', 'muito profundo'],
        },
      },
    },
    obj: {
      a: 'a',
      b: 'b',
    },
  },
}

i18n(store, { dictionary: locales })

/**
 * Dummy test
 */
describe('Utilities', () => {
  it('should check if a variable is an object', () => {
    expect(isObject({})).toBe(true)
    expect(isObject(1)).toBe(false)
  })
})

describe('Localization', () => {
  it('should start with a clean store', () => {
    const { _, locale } = store.get()
    expect(locale).toBeFalsy()
    expect(_).toBeFalsy()
  })

  it('should change the locale after a "locale" store event', () => {
    store.fire('locale', 'en')
    const { locale, _ } = store.get()

    expect(locale).toBe('en')
    expect(_).toBeInstanceOf(Function)
  })

  it('should have a .i18n.setLocale() method', () => {
    expect(store.i18n.setLocale).toBeInstanceOf(Function)

    store.i18n.setLocale('pt-br')
    const { locale } = store.get()

    expect(locale).toBe('pt-br')
  })

  it('should return the message id when no message identified by it was found', () => {
    store.i18n.setLocale('pt-br')
    const { _ } = store.get()

    expect(_('non.existent')).toBe('non.existent')
  })

  it('should get a message by its id', () => {
    const { _ } = store.get()
    expect(_('test')).toBe(locales['pt-br'].test)
  })

  it('should get a deep nested message by its string path', () => {
    store.i18n.setLocale('pt-br')
    const { _ } = store.get()

    expect(_('obj.b')).toBe('b')
  })

  it('should get a message within an array by its index', () => {
    store.i18n.setLocale('pt-br')
    const { _ } = store.get()

    expect(_('phrases[1]')).toBe(locales['pt-br'].phrases[1])

    /** Not found */
    expect(_('phrases[2]')).toBe('phrases[2]')
  })

  it('should interpolate with {numeric} placeholders', () => {
    store.i18n.setLocale('pt-br')
    const { _ } = store.get()

    expect(_('interpolation.key', ['Chris', 'o dia'])).toBe(
      'Olá, Chris! Como está o dia?',
    )
  })

  it('should interpolate with {named} placeholders', () => {
    store.i18n.setLocale('pt-br')
    const { _ } = store.get()

    expect(
      _('interpolation.named', {
        name: 'Chris',
        time: 'o dia',
      }),
    ).toBe('Olá, Chris! Como está o dia?')
  })

  it('should handle pluralization with _.plural()', () => {
    store.i18n.setLocale('pt-br')
    const { _ } = store.get()

    expect(_.plural('pluralization')).toBe('Zero')
    expect(_.plural('pluralization', 0)).toBe('Zero')
    expect(_.plural('pluralization', 1)).toBe('Um')
    expect(_.plural('pluralization', -1)).toBe('Um')
    expect(_.plural('pluralization', -1000)).toBe('Muito!')
    expect(_.plural('pluralization', 2)).toBe('Muito!')
    expect(_.plural('pluralization', 100)).toBe('Muito!')
  })
})

describe('Localization utilities', () => {
  it('should capital a translated message', () => {
    store.i18n.setLocale('pt-br')
    const { _ } = store.get()

    expect(capital('Adoro banana')).toBe('Adoro banana')
    expect(_.capital('phrase')).toBe('Adoro banana')
  })

  it('should title a translated message', () => {
    store.i18n.setLocale('pt-br')
    const { _ } = store.get()

    expect(title('Adoro Banana')).toBe('Adoro Banana')
    expect(_.title('phrase')).toBe('Adoro Banana')
  })

  it('should lowercase a translated message', () => {
    store.i18n.setLocale('pt-br')
    const { _ } = store.get()

    expect(lower('adoro banana')).toBe('adoro banana')
    expect(_.lower('phrase')).toBe('adoro banana')
  })

  it('should uppercase a translated message', () => {
    store.i18n.setLocale('pt-br')
    const { _ } = store.get()

    expect(upper('ADORO BANANA')).toBe('ADORO BANANA')
    expect(_.upper('phrase')).toBe('ADORO BANANA')
  })
})
