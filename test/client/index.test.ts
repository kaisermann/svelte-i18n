import { Formatter } from '../../src/client/types'
import {
  dictionary,
  locale,
  format,
  getClientLocale,
  addCustomFormats,
  customFormats,
} from '../../src/client'

global.Intl = require('intl')

let _: Formatter
let currentLocale: string

const dict = {
  pt: require('../fixtures/pt.json'),
  en: require('../fixtures/en.json'),
  'en-GB': require('../fixtures/en-GB.json'),
}

format.subscribe(formatFn => {
  _ = formatFn
})
dictionary.set(dict)
locale.subscribe((l: string) => {
  currentLocale = l
})
locale.set('pt')

describe('locale', () => {
  it('should change locale', () => {
    locale.set('pt')
    expect(currentLocale).toBe('pt')
    locale.set('en')
    expect(currentLocale).toBe('en')
  })

  it('should fallback to existing locale', () => {
    locale.set('pt-BR')
    expect(currentLocale).toBe('pt')

    locale.set('en-US')
    expect(currentLocale).toBe('en')
  })

  it("should throw an error if locale doesn't exist", () => {
    expect(() => locale.set('FOO')).toThrow()
  })
})

describe('dictionary', () => {
  // todo test this better
  it('allows to dynamically import a dictionary', async () => {
    dictionary.update((dict: any) => {
      dict.es = () => import('../fixtures/es.json')
      return dict
    })
    await locale.set('es')
    expect(currentLocale).toBe('es')
  })
})

describe('formatting', () => {
  it('should translate to current locale', () => {
    locale.set('pt')
    expect(_('switch.lang')).toBe('Trocar idioma')
    locale.set('en')
    expect(_('switch.lang')).toBe('Switch language')
  })

  it('should fallback to message id if id is not found', () => {
    locale.set('en')
    expect(_('batatinha.quente')).toBe('batatinha.quente')
  })

  it('should fallback to default value if id is not found', () => {
    locale.set('en')
    expect(_('batatinha.quente', { default: 'Hot Potato' })).toBe('Hot Potato')
  })

  it('should fallback to generic locale XX if id not found in XX-YY', () => {
    locale.set('en-GB')
    expect(_('sneakers')).toBe('trainers')
    expect(_('switch.lang')).toBe('Switch language')
  })

  it('should accept single object with id prop as the message path', () => {
    locale.set('pt')
    expect(_({ id: 'switch.lang' })).toBe('Trocar idioma')
    locale.set('en')
    expect(_({ id: 'switch.lang' })).toBe('Switch language')
  })

  it('should translate to passed locale', () => {
    expect(_({ id: 'switch.lang', locale: 'pt' })).toBe('Trocar idioma')
    expect(_('switch.lang', { locale: 'en' })).toBe('Switch language')
  })

  it('should interpolate message with variables', () => {
    locale.set('en')
    expect(_('greeting.message', { values: { name: 'Chris' } })).toBe('Hello Chris, how are you?')
  })

  it('should interpolate message with variables according to passed locale', () => {
    locale.set('en')
    expect(_('greeting.message', { values: { name: 'Chris' }, locale: 'pt' })).toBe(
      'Olá Chris, como vai?',
    )
  })
})

describe('utilities', () => {
  describe('get locale', () => {
    beforeEach(() => {
      delete window.location
      window.location = {
        hash: '',
        search: '',
      } as any
    })

    it('should get the locale based on the passed hash parameter', () => {
      window.location.hash = '#locale=en-US&lang=pt-BR'
      expect(getClientLocale({ hash: 'locale' })).toBe('en-US')
      expect(getClientLocale({ hash: 'lang' })).toBe('pt-BR')
    })

    it('should get the locale based on the passed search parameter', () => {
      window.location.search = '?locale=en-US&lang=pt-BR'
      expect(getClientLocale({ search: 'locale' })).toBe('en-US')
      expect(getClientLocale({ search: 'lang' })).toBe('pt-BR')
    })

    it('should get the locale based on the navigator language', () => {
      expect(getClientLocale({ navigator: true })).toBe(window.navigator.language)
    })

    it('should get the fallback locale', () => {
      expect(getClientLocale({ navigator: false, default: 'pt' })).toBe('pt')
      expect(getClientLocale({ hash: 'locale', default: 'pt' })).toBe('pt')
    })
  })

  describe('format utils', () => {
    beforeAll(() => {
      locale.set('en')
    })

    it('should capital a translated message', () => {
      expect(_.capital('hi')).toBe('Hi yo')
    })

    it('should title a translated message', () => {
      expect(_.title('hi')).toBe('Hi Yo')
    })

    it('should lowercase a translated message', () => {
      expect(_.lower('hi')).toBe('hi yo')
    })

    it('should uppercase a translated message', () => {
      expect(_.upper('hi')).toBe('HI YO')
    })

    const date = new Date(2019, 3, 24, 23, 45)
    it('should format a time value', () => {
      locale.set('en')
      expect(_.time(date)).toBe('11:45 PM')
      expect(_.time(date, { format: 'medium' })).toBe('11:45:00 PM')
      expect(_.time(date, { format: 'medium', locale: 'pt-BR' })).toBe('23:45:00')
    })

    it('should format a date value', () => {
      expect(_.date(date)).toBe('4/24/19')
      expect(_.date(date, { format: 'medium' })).toBe('Apr 24, 2019')
    })
    // number
    it('should format a date value', () => {
      expect(_.number(123123123)).toBe('123,123,123')
    })
  })
})

describe('custom formats', () => {
  beforeAll(() => {
    locale.set('pt-BR')
  })

  it('should have default number custom formats', () => {
    expect(customFormats.number).toMatchObject({
      scientific: { notation: 'scientific' },
      engineering: { notation: 'engineering' },
      compactLong: { notation: 'compact', compactDisplay: 'long' },
      compactShort: { notation: 'compact', compactDisplay: 'short' },
    })
  })

  it('should allow to add custom formats', () => {
    addCustomFormats({
      number: {
        usd: { style: 'currency', currency: 'USD' },
      },
    })

    expect(customFormats.number).toMatchObject({
      usd: { style: 'currency', currency: 'USD' },
    })
  })

  it('should format messages with custom formats', () => {
    addCustomFormats({
      number: {
        usd: { style: 'currency', currency: 'USD' },
        brl: { style: 'currency', currency: 'BRL' },
      },
      date: {
        customDate: { year: 'numeric', era: 'short' },
      },
      time: {
        customTime: { hour: '2-digit', month: 'narrow' },
      },
    })

    locale.set('en-US')

    expect(_.number(123123123, { format: 'usd' })).toContain('$123,123,123.00')
    expect(_.number(123123123, { format: 'brl' })).toContain('R$123,123,123.00')

    expect(_.date(new Date(2019, 0, 1), { format: 'customDate' })).toEqual('2019 AD')

    expect(_.time(new Date(2019, 0, 1, 2, 0, 0), { format: 'customTime' })).toEqual('Jan, 02')
  })
})
