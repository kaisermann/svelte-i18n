import { defineMessages } from '../../src/client'

test('defineMessages returns the identity of its first argument', () => {
  const obj = {}
  expect(obj).toBe(defineMessages(obj))
})
