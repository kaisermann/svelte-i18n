import { get } from 'svelte/store'

import {
  hasLocaleQueue,
  flush,
  registerLocaleLoader,
  resetQueues,
} from '../../../src/client/includes/loaderQueue'
import { getMessageFromDictionary } from '../../../src/client/stores/dictionary'
import { $isLoading } from '../../../src/client/stores/loading'
import { getOptions } from '../../../src/client/configs'

beforeEach(() => {
  resetQueues()
})

const loader = (content: any) => () => new Promise(res => res(content))

test('registers a locale loader', () => {
  expect(hasLocaleQueue('pt-BR')).toBe(false)
  registerLocaleLoader('pt-BR', loader({ message: 'Mensagem' }))
  expect(hasLocaleQueue('pt-BR')).toBe(true)
})

test('checks if exist queues of locale and its fallbacks', () => {
  registerLocaleLoader('en', loader({ field: 'Name' }))
  expect(hasLocaleQueue('en-US')).toBe(true)
})

test("does nothing if there's no queue for a locale", () => {
  expect(flush('foo')).toBe(undefined)
})

test('flushes the queue of a locale and its fallbacks and merge the result with the dictionary', async () => {
  registerLocaleLoader('en', loader({ field: 'Name' }))
  registerLocaleLoader('en-US', loader({ field_2: 'Lastname' }))

  await flush('en-US')

  expect(getMessageFromDictionary('en', 'field')).toBe('Name')
  expect(getMessageFromDictionary('en-US', 'field_2')).toBe('Lastname')

  expect(hasLocaleQueue('en')).toBe(false)
  expect(hasLocaleQueue('en-US')).toBe(false)
})

test('consecutive flushes return the same promise', async () => {
  registerLocaleLoader('en', async () => ({}))

  const flushA = flush('en')
  const flushB = flush('en')
  const flushC = flush('en')

  expect(flushB).toStrictEqual(flushA)
  expect(flushC).toStrictEqual(flushA)
})

test('should set loading to true if passed min delay and false after loading', () => {
  registerLocaleLoader(
    'en',
    () =>
      new Promise(res =>
        setTimeout(() => res({}), getOptions().loadingDelay * 2)
      )
  )

  const flushPromise = flush('en')

  return new Promise((res, rej) => {
    setTimeout(() => {
      if (get($isLoading) === true) return res()
      return rej('$isLoading should be "true"')
    }, getOptions().loadingDelay)
  }).then(() => {
    flushPromise.then(
      () =>
        new Promise((res, rej) => {
          if (get($isLoading) === false) return res()
          return rej('$isLoading should be "false" after loading')
        })
    )
  })
})
