import {
  getLocaleFromQueryString,
  getLocaleFromHash,
  getLocaleFromNavigator,
  getLocaleFromPathname,
  getLocaleFromHostname,
} from '../../../src/runtime/includes/localeGetters'
import { flatObj } from '../../../src/runtime/includes/flatObj'

describe('getting client locale', () => {
  beforeEach(() => {
    delete window.location
    window.location = {
      pathname: '/',
      hostname: 'example.com',
      hash: '',
      search: '',
    } as any
  })

  test('gets the locale based on the passed hash parameter', () => {
    window.location.hash = '#locale=en-US&lang=pt-BR'
    expect(getLocaleFromHash('lang')).toBe('pt-BR')
  })

  test('gets the locale based on the passed search parameter', () => {
    window.location.search = '?locale=en-US&lang=pt-BR'
    expect(getLocaleFromQueryString('lang')).toBe('pt-BR')
  })

  test('gets the locale based on the navigator language', () => {
    expect(getLocaleFromNavigator()).toBe(window.navigator.language)
  })

  test('gets the locale based on the pathname', () => {
    window.location.pathname = '/en-US/foo/'
    expect(getLocaleFromPathname(/^\/(.*?)\//)).toBe('en-US')
  })

  test('gets the locale base on the hostname', () => {
    window.location.hostname = 'pt.example.com'
    expect(getLocaleFromHostname(/^(.*?)\./)).toBe('pt')
  })

  test('returns null if no locale was found', () => {
    expect(getLocaleFromQueryString('lang')).toBe(null)
  })
})

describe('deep object handling', () => {
  test('flattens a deep object', () => {
    const obj = {
      a: { b: { c: { d: 'foo' } } },
      e: { f: 'bar' },
    }
    expect(flatObj(obj)).toMatchObject({
      'a.b.c.d': 'foo',
      'e.f': 'bar',
    })
  })

  test('flattens a deep object with array values', () => {
    const obj = {
      a: { b: { c: { d: ['foo', 'bar'] } } },
      e: { f: ['foo', 'bar'] },
    }
    expect(flatObj(obj)).toMatchObject({
      'a.b.c.d.0': 'foo',
      'a.b.c.d.1': 'bar',
      'e.f.0': 'foo',
      'e.f.1': 'bar',
    })
  })
})
