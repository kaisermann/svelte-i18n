// // TODO remake this, it's a mess
// import { Formatter } from '../../src/client/types'
// import {
//   dictionary,
//   locale,
//   format,
//   addCustomFormats,
//   customFormats,
//   register,
//   waitLocale,
// } from '../../src/client'
// import { getClientLocale } from '../../src/client/includes/utils'

// global.Intl = require('intl')

// let _: Formatter
// let currentLocale: string

// const dict = {
//   en: require('../fixtures/en.json'),
// }

// register('en-GB', () => import('../fixtures/en-GB.json'))
// register('pt', () => import('../fixtures/pt.json'))
// register('pt-BR', () => import('../fixtures/pt-BR.json'))
// register('pt-PT', () => import('../fixtures/pt-PT.json'))

// format.subscribe(formatFn => {
//   _ = formatFn
// })
// dictionary.set(dict)
// locale.subscribe((l: string) => {
//   currentLocale = l
// })

// describe('locale', () => {
//   it('should change locale', async () => {
//     await locale.set('en')
//     expect(currentLocale).toBe('en')

//     await locale.set('en-US')
//     expect(currentLocale).toBe('en-US')
//   })
// })

// describe('dictionary', () => {
//   it('load a partial dictionary and merge it with the existing one', async () => {
//     await locale.set('en')
//     register('en', () => import('../fixtures/partials/en.json'))
//     expect(_('page.title_about')).toBe('page.title_about')

//     await waitLocale('en')
//     expect(_('page.title_about')).toBe('About')
//   })
// })

// describe('formatting', () => {
//   it('should translate to current locale', async () => {
//     await locale.set('en')
//     expect(_('switch.lang')).toBe('Switch language')
//   })

//   it('should fallback to message id if id is not found', async () => {
//     await locale.set('en')
//     expect(_('batatinha.quente')).toBe('batatinha.quente')
//   })

//   it('should fallback to default value if id is not found', async () => {
//     await locale.set('en')
//     expect(_('batatinha.quente', { default: 'Hot Potato' })).toBe('Hot Potato')
//   })

//   it('should fallback to generic locale XX if id not found in XX-YY', async () => {
//     await locale.set('en-GB')
//     expect(_('sneakers', { locale: 'en-GB' })).toBe('trainers')
//   })

//   it('should fallback to generic locale XX if id not found in XX-YY', async () => {
//     await locale.set('en-GB')
//     expect(_('switch.lang')).toBe('Switch language')
//   })

//   it('should accept single object with id prop as the message path', async () => {
//     await locale.set('en')
//     expect(_({ id: 'switch.lang' })).toBe('Switch language')
//   })

//   it('should translate to passed locale', async () => {
//     await waitLocale('pt-BR')
//     expect(_('switch.lang', { locale: 'pt' })).toBe('Trocar idioma')
//   })

//   it('should interpolate message with variables', async () => {
//     await locale.set('en')
//     expect(_('greeting.message', { values: { name: 'Chris' } })).toBe(
//       'Hello Chris, how are you?'
//     )
//   })
// })

// describe('utilities', () => {

//   describe('format utils', () => {
//     beforeAll(async () => {
//       await locale.set('en')
//     })

//     it('should capital a translated message', () => {
//       expect(_.capital('hi')).toBe('Hi yo')
//     })

//     it('should title a translated message', () => {
//       expect(_.title('hi')).toBe('Hi Yo')
//     })

//     it('should lowercase a translated message', () => {
//       expect(_.lower('hi')).toBe('hi yo')
//     })

//     it('should uppercase a translated message', () => {
//       expect(_.upper('hi')).toBe('HI YO')
//     })

//     const date = new Date(2019, 3, 24, 23, 45)
//     it('should format a time value', async () => {
//       await locale.set('en')
//       expect(_.time(date)).toBe('11:45 PM')
//       expect(_.time(date, { format: 'medium' })).toBe('11:45:00 PM')
//       expect(_.time(date, { format: 'medium', locale: 'pt-BR' })).toBe(
//         '23:45:00'
//       )
//     })

//     it('should format a date value', () => {
//       expect(_.date(date)).toBe('4/24/19')
//       expect(_.date(date, { format: 'medium' })).toBe('Apr 24, 2019')
//     })
//     // number
//     it('should format a date value', () => {
//       expect(_.number(123123123)).toBe('123,123,123')
//     })
//   })
// })

// describe('custom formats', () => {
//   it('should format messages with custom formats', async () => {
//     addCustomFormats({
//       number: {
//         usd: { style: 'currency', currency: 'USD' },
//         brl: { style: 'currency', currency: 'BRL' },
//       },
//       date: {
//         customDate: { year: 'numeric', era: 'short' },
//       },
//       time: {
//         customTime: { hour: '2-digit', minute: '2-digit' },
//       },
//     })

//     await locale.set('en-US')

//     expect(_.number(123123123, { format: 'usd' })).toContain('$123,123,123.00')

//     expect(_.date(new Date(2019, 0, 1), { format: 'customDate' })).toEqual(
//       '2019 AD'
//     )

//     expect(
//       _.time(new Date(2019, 0, 1, 2, 0, 0), { format: 'customTime' })
//     ).toEqual('02:00')
//   })
// })
