import { getClientLocale } from '../../../src/client/includes/getClientLocale'
import { flatObj } from '../../../src/client/includes/flatObj'

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
    expect(
      getClientLocale({
        hash: 'lang',
      })
    ).toBe('pt-BR')
  })

  test('gets the locale based on the passed search parameter', () => {
    window.location.search = '?locale=en-US&lang=pt-BR'
    expect(
      getClientLocale({
        search: 'lang',
      })
    ).toBe('pt-BR')
  })

  test('gets the locale based on the navigator language', () => {
    expect(
      getClientLocale({
        navigator: true,
      })
    ).toBe(window.navigator.language)
  })

  test('gets the locale based on the pathname', () => {
    window.location.pathname = '/en-US/foo/'
    expect(
      getClientLocale({
        pathname: /^\/(.*?)\//,
      })
    ).toBe('en-US')
  })

  test('gets the locale base on the hostname', () => {
    window.location.hostname = 'pt.example.com'
    expect(
      getClientLocale({
        hostname: /^(.*?)\./,
      })
    ).toBe('pt')
  })

  test('hostname precedes pathname', () => {
    window.location.pathname = '/en-US/foo/'
    window.location.hostname = 'pt.example.com'
    expect(
      getClientLocale({
        hostname: /^(.*?)\./,
        pathname: /^\/(.*?)\//,
      })
    ).toBe('pt')
  })

  test('pathname precedes navigator', () => {
    window.location.pathname = '/it-IT/foo/'
    expect(
      getClientLocale({
        pathname: /^\/(.*?)\//,
        navigator: true,
      })
    ).toBe('it-IT')
  })

  test('navigator precedes search', () => {
    window.location.search = '?lang=pt-BR'
    expect(
      getClientLocale({
        navigator: true,
        search: 'lang',
      })
    ).toBe('en-US')
  })

  test('search precedes hash', () => {
    window.location.hash = '#lang=pt-BR'
    window.location.search = '?lang=it-IT'
    expect(
      getClientLocale({
        hash: 'lang',
        search: 'lang',
      })
    ).toBe('it-IT')
  })

  test('returns null if no locale was found', () => {
    expect(
      getClientLocale({
        search: 'lang',
      })
    ).toBe(null)
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
