import { lookup, lookupCache } from '../../../src/runtime/includes/lookup'
import { $dictionary, addMessages } from '../../../src/runtime/stores/dictionary'

beforeEach(() => {
  $dictionary.set({})
})

test('returns null if no locale was passed', () => {
  expect(lookup('message.id', undefined)).toBe(null)
  expect(lookup('message.id', null)).toBe(null)
})

test('gets a shallow message of a locale dictionary', () => {
  addMessages('en', { field: 'name' })

  expect(lookup('field', 'en')).toBe('name')
})

test('gets a deep message of a locale dictionary', () => {
  addMessages('en', { deep: { field: 'lastname' } })
  expect(lookup('deep.field', 'en')).toBe('lastname')
})

test('gets a message from the fallback dictionary', () => {
  addMessages('en', { field: 'name' })

  expect(lookup('field', 'en-US')).toBe('name')
})

test('caches found messages by locale', () => {
  addMessages('en', { field: 'name' })
  addMessages('pt', { field: 'nome' })
  lookup('field', 'en-US')
  lookup('field', 'pt')

  expect(lookupCache).toMatchObject({
    'en-US': { field: 'name' },
    pt: { field: 'nome' },
  })
})

test("doesn't cache falsy messages", () => {
  addMessages('en', { field: 'name' })
  addMessages('pt', { field: 'nome' })
  lookup('field_2', 'en-US')
  lookup('field_2', 'pt')
  expect(lookupCache).not.toMatchObject({
    'en-US': { field_2: 'name' },
    pt: { field_2: 'nome' },
  })
})
