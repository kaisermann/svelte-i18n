import { deepGet } from '../../src/cli/includes/deepGet'

describe('deep object handling', () => {
  test('gets a deep property', () => {
    const obj = {
      a: { b: { c: { d: ['foo', 'bar'] } } },
    }
    expect(deepGet(obj, 'a.b.c.d.1')).toBe('bar')
  })

  test('returns undefined for if some property not found', () => {
    const obj = {
      a: { b: 1 },
    }
    expect(deepGet(obj, 'c.b')).toBe(undefined)
  })
})
