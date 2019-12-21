import { lookupMessage } from '../../../src/client/includes/lookup'
import { addMessages } from '../../../src/client/stores/dictionary'


test('a nested key', () => {
	addMessages('en', { key:'value',nested_key:'nested {{key}}' })
	expect(lookupMessage('nested_key', 'en')).toBe('nested value')
})

test('a deep nested key', () => {
	addMessages('en', { key:'value',deep_nested_key:'deep {{nested_key}}',nested_key:'nested {{key}}' })
	expect(lookupMessage('deep_nested_key', 'en')).toBe('deep nested value')
})

test('a nested key with deep path', () => {
	addMessages('en', { key:{deep_key:'deep value'},nested_key:'nested {{key.deep_key}}' })
	expect(lookupMessage('nested_key', 'en')).toBe('nested deep value')
})

test('a deep nested key with deep path', () => {
	addMessages('en', { key:{deep_key:'deep value'},deep_nested_key:'deep {{nested_key}}',nested_key:'nested {{key.deep_key}}' })
	expect(lookupMessage('deep_nested_key', 'en')).toBe('deep nested deep value')
})

test('multipel nested keys', () => {
	addMessages('en', { key:'value',newKey:'newValue',nested_key:'nested {{key}} {{newKey}}' })
	expect(lookupMessage('nested_key', 'en')).toBe('nested value newValue')
})

test('multipel similar nested keys', () => {
	addMessages('en', { key:'value',nested_key:'nested {{key}} {{key}}' })
	expect(lookupMessage('nested_key', 'en')).toBe('nested value value')
})

test('empty nested', () => {
	addMessages('en', { empty_nested_key:'just me{{}}' })
	expect(lookupMessage('empty_nested_key', 'en')).toBe('just me') 
})

test('full empty nested', () => {
	addMessages('en', { full_empty_nested_key:'{{}}' })
	expect(lookupMessage('full_empty_nested_key', 'en')).toBe(null)
})

test('nested key with dots', () => {
	addMessages('en', { 'key.with.dots':'value',nested_key:'nested {{key.with.dots}}' })
	expect(lookupMessage('nested_key', 'en')).toBe('nested value')
})
