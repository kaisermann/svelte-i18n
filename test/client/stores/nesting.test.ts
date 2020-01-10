import { lookup } from '../../../src/client/includes/lookup'
import { addMessages } from '../../../src/client/stores/dictionary'
import { Formatter } from '../../../src/client/types/index'
import { $format } from '../../../src/client/stores/format'
let format: Formatter
$format.subscribe(f => (format = f))

test('a nested key', () => {
	addMessages('en', { key:'value',nested_key:'nested {{key}}' })
	expect(lookup('nested_key', 'en')).toBe('nested value')
})

test('a deep nested key', () => {
	addMessages('en', { key:'value',deep_nested_key:'deep {{nested_key}}',nested_key:'nested {{key}}' })
	expect(lookup('deep_nested_key', 'en')).toBe('deep nested value')
})

test('a nested key with deep path', () => {
	addMessages('en', { key:{deep_key:'deep value'},nested_key:'nested {{key.deep_key}}' })
	expect(lookup('nested_key', 'en')).toBe('nested deep value')
})

test('a deep nested key with deep path', () => {
	addMessages('en', { key:{deep_key:'deep value'},deep_nested_key:'deep {{nested_key}}',nested_key:'nested {{key.deep_key}}' })
	expect(lookup('deep_nested_key', 'en')).toBe('deep nested deep value')
})

test('multipel nested keys', () => {
	addMessages('en', { key:'value',newKey:'newValue',nested_key:'nested {{key}} {{newKey}}' })
	expect(lookup('nested_key', 'en')).toBe('nested value newValue')
})

test('multipel similar nested keys', () => {
	addMessages('en', { key:'value',nested_key:'nested {{key}} {{key}}' })
	expect(lookup('nested_key', 'en')).toBe('nested value value')
})

test('empty nested', () => {
	addMessages('en', { empty_nested_key:'just me{{}}' })
	expect(lookup('empty_nested_key', 'en')).toBe('just me') 
})

test('full empty nested', () => {
	addMessages('en', { full_empty_nested_key:'{{}}' })
	expect(lookup('full_empty_nested_key', 'en')).toBe(null)
})

test('nested key with dots', () => {
	addMessages('en', { 'key.with.dots':'value',nested_key:'nested {{key.with.dots}}' })
	expect(lookup('nested_key', 'en')).toBe('nested value')
})

test('nesting dotted key priority check', () => {
	addMessages('en', { 'key.dot':'value',key:{dot:"not_value"},nested_key:'{{key.dot}}' })
	expect(lookup('nested_key', 'en')).toBe('value')
})

test('seperate addMessage with nesting', () => {
	addMessages('en', { yes: 'Yes', no: 'No' })
	addMessages('en', { confirmation: 'Please answer {{yes}} or {{no}}' })
	expect(lookup('confirmation', 'en')).toBe('Please answer Yes or No')
})

test('nest the older key after new addMessage define it', () => {
	addMessages('en', { will_be_defined: 'Hi {{who_am_i}}' })
	expect(lookup('will_be_defined', 'en')).toBe('Hi {{who_am_i}}')
	addMessages('en', { who_am_i: 'Ehsan' })
	expect(lookup('will_be_defined', 'en')).toBe('Hi Ehsan')
})

test('nested key with argument in values', () => {
	addMessages('en', { key: '{arg}', nested: '{{key}}' })
	expect(format({id:'nested', values:{arg:'argument value'} , locale:'en'} )).toBe('argument value')
})
