import {
  hasLocaleQueue,
  flush,
  registerLocaleLoader,
  resetQueues,
} from '../../../src/runtime/modules/loaderQueue';
import { getMessageFromDictionary } from '../../../src/runtime/stores/dictionary';

beforeEach(() => {
  resetQueues();
});

const loader = (content: any) => () => new Promise((res) => res(content));

test('registers a locale loader', () => {
  expect(hasLocaleQueue('pt-BR')).toBe(false);
  registerLocaleLoader('pt-BR', loader({ message: 'Mensagem' }));
  expect(hasLocaleQueue('pt-BR')).toBe(true);
});

test('checks if exist queues of locale and its fallbacks', () => {
  registerLocaleLoader('en', loader({ field: 'Name' }));
  expect(hasLocaleQueue('en-US')).toBe(true);
});

test("does nothing if there's no queue for a locale", async () => {
  expect(await flush('foo')).toBeUndefined();
});

test('flushes the queue of a locale and its fallbacks and merge the result with the dictionary', async () => {
  registerLocaleLoader('en', loader({ field: 'Name' }));
  registerLocaleLoader('en-US', loader({ field_2: 'Lastname' }));

  await flush('en-US');

  expect(getMessageFromDictionary('en', 'field')).toBe('Name');
  expect(getMessageFromDictionary('en-US', 'field_2')).toBe('Lastname');

  expect(hasLocaleQueue('en')).toBe(false);
  expect(hasLocaleQueue('en-US')).toBe(false);
});

test('consecutive flushes return the same promise', async () => {
  registerLocaleLoader('en', async () => ({}));

  const flushA = flush('en');
  const flushB = flush('en');
  const flushC = flush('en');

  expect(flushB).toStrictEqual(flushA);
  expect(flushC).toStrictEqual(flushA);
});

test('waits for loaders added while already flushing', async () => {
  registerLocaleLoader(
    'en',
    () => new Promise((res) => setTimeout(() => res({ foo: 'foo' }), 300)),
  );

  const flushPromise = flush('en');

  registerLocaleLoader(
    'en',
    () => new Promise((res) => setTimeout(() => res({ bar: 'bar' }))),
  );

  await flushPromise;

  expect(getMessageFromDictionary('en', 'foo')).toBe('foo');
  expect(getMessageFromDictionary('en', 'bar')).toBe('bar');
});
