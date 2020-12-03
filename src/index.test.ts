import { slugify } from './index'

test('replaces invalid characters with -', () => {
  const input = '*+~.()\'"!:@&[]`,/ %$#?{}|><=_^'
  const output = '-'.repeat(input.length)

  expect(slugify(input)).toBe(output)
})

test('lowercases the input', () => {
  const input = `I'M NOT LOWERCASE`
  const output = 'i-m-not-lowercase'

  expect(slugify(input)).toBe(output)
})

test('replaces diactrics characters with their counterparts without diactrics', () => {
  const input =
    'ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆÍÌÎÏŇÑÓÖÒÔÕØŘŔŠŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇíìîïňñóöòôõøðřŕšťúůüùûýÿžþÞĐđßÆa'

  const output = 'AAAAAACCCDEEEEEEEEIIIINNOOOOOORRSTUUUUUYYZaaaaaacccdeeeeeeeeiiiinnooooooorrstuuuuuyyzbBDdBAa'.toLowerCase()

  expect(slugify(input)).toBe(output)
})
