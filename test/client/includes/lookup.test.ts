import { lookupMessage, lookupCache } from '../../../src/client/includes/lookup'
import { $dictionary, addMessages } from '../../../src/client/stores/dictionary'

beforeEach(() => {
  $dictionary.set({})
})

test('returns null if no locale was passed', () => {
  expect(lookupMessage('message.id', undefined)).toBe(null)
  expect(lookupMessage('message.id', null)).toBe(null)
})

test('gets a shallow message of a locale dictionary', () => {
  addMessages('en', { field: 'name' })
  expect(lookupMessage('field', 'en')).toBe('name')
})

test('gets a deep message of a locale dictionary', () => {
  addMessages('en', { deep: { field: 'lastname' } })
  expect(lookupMessage('deep.field', 'en')).toBe('lastname')
})

test('gets a message from the fallback dictionary', () => {
  addMessages('en', { field: 'name' })
  expect(lookupMessage('field', 'en-US')).toBe('name')
})

test('caches found messages by locale', () => {
  addMessages('en', { field: 'name' })
  addMessages('pt', { field: 'nome' })
  lookupMessage('field', 'en-US')
  lookupMessage('field', 'pt-BR')
  expect(lookupCache).toMatchObject({
    'en-US': { field: 'name' },
    'pt-BR': { field: 'nome' },
  })
})

test("doesn't cache falsy messages", () => {
  addMessages('en', { field: 'name' })
  addMessages('pt', { field: 'nome' })
  lookupMessage('field_2', 'en-US')
  lookupMessage('field_2', 'pt-BR')
  expect(lookupCache).not.toMatchObject({
    'en-US': { field_2: 'name' },
    'pt-BR': { field_2: 'nome' },
  })
})
