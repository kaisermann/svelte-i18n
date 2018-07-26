import i18n from '../src/svelte-i18n'
import { Store } from 'svelte/store.umd'
import { capitalize, titlelize, upper, lower, getNestedProp } from '../src/utils'

const store = new Store()
const locales = {
  'pt-br': {
    test: 'teste',
    phrase: 'Adoro banana',
    phrases: ['Frase 1', 'Frase 2']
  },
  po: {
    test: 'prøve',
    phrase: 'Jeg elsker banan',
    phrases: ['sætning 1', 'sætning 2']
  }
}

i18n(store, locales)

/**
 * Dummy test
 */
describe('utils', () => {
  it('works', () => {
    expect(getNestedProp(store['pt-br'], 'phrases[3]')).toBe(undefined)
  })
})
describe('Dummy test', () => {
  it('works if true is truthy', () => {
    expect(store.get().locale).toBeFalsy()
    expect(store.get()._).toBeFalsy()

    store.fire('locale', 'en')
    expect(store.get().locale).toBe('en')
    store.locale('pt-br')
    expect(store.get().locale).toBe('pt-br')
    expect(store.get()._).toBeInstanceOf(Function)
    expect(store.get()._('non-existent')).toBe('non-existent')
    expect(store.get()._('test')).toBe(locales['pt-br'].test)
    store.fire('locale', 'po')
    expect(store.get()._('test')).not.toBe(locales['pt-br'].test)
    expect(store.get()._('test')).toBe(locales.po.test)
    expect(store.get()._('phrases[1]')).toBe(locales.po.phrases[1])
    expect(store.get()._('phrases[2]')).toBe('phrases[2]')
    expect(store.get()._.capitalize('phrase')).toBe(capitalize(locales.po.phrase))
    expect(store.get()._.titlelize('phrase')).toBe(titlelize(locales.po.phrase))
    expect(store.get()._.upper('phrase')).toBe(upper(locales.po.phrase))
    expect(store.get()._.lower('phrase')).toBe(lower(locales.po.phrase))
  })
})
