import { getIn } from '../../src/cli/includes/getIn'

describe('deep object handling', () => {
  test('gets a deep property', () => {
    const obj = {
      a: { b: { c: { d: ['foo', 'bar'] } } },
    }
    expect(getIn(obj, 'a.b.c.d.1')).toBe('bar')
  })

  test('returns undefined for if some property not found', () => {
    const obj = {
      a: { b: 1 },
    }
    expect(getIn(obj, 'c.b')).toBe(undefined)
  })
})
