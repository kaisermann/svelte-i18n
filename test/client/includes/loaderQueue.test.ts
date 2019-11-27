import {
  hasLocaleQueue,
  flushQueue,
  registerLocaleLoader,
  resetQueues,
} from '../../../src/client/includes/loaderQueue'
import { getMessageFromDictionary } from '../../../src/client/stores/dictionary'

beforeEach(() => {
  resetQueues()
})

const loader = (content: any) => () => new Promise((res, rej) => res(content))

test('registers a locale loader', () => {
  expect(hasLocaleQueue('pt-BR')).toBe(false)
  registerLocaleLoader('pt-BR', loader({ message: 'Mensagem' }))
  expect(hasLocaleQueue('pt-BR')).toBe(true)
})

test('checks queues of locale and its fallbacks', () => {
  registerLocaleLoader('en', loader({ field: 'Name' }))
  expect(hasLocaleQueue('en-US')).toBe(true)
})

test('flushes the queue of a locale and its fallbacks and merge the result with the dictionary', async () => {
  registerLocaleLoader('en', loader({ field: 'Name' }))
  registerLocaleLoader('en-US', loader({ field_2: 'Lastname' }))

  await flushQueue('en-US')

  expect(getMessageFromDictionary('en', 'field')).toBe('Name')
  expect(getMessageFromDictionary('en-US', 'field_2')).toBe('Lastname')

  expect(hasLocaleQueue('en')).toBe(false)
  expect(hasLocaleQueue('en-US')).toBe(false)
})

test('consecutive flushes return the same promise', () => {
  // const promiseA = () => new Promise((res, rej) => setTimeout(res, 50))
  registerLocaleLoader('en', async () => {})

  const flushA = flushQueue('en')
  const flushB = flushQueue('en')

  expect(flushB).toStrictEqual(flushA)
})
