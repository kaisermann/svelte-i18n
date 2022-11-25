import { writable, derived, get } from 'svelte/store';

import { unwrapFunctionStore } from '../../../src/runtime';

import type { Readable } from 'svelte/store';

test('unwraps the function from a store', () => {
  const store = writable(0);
  const functionStore = derived(store, ($store) => () => $store) as Readable<
    () => number
  >;

  const unwrapped = unwrapFunctionStore(functionStore);

  expect(get(functionStore)()).toBe(0);
  expect(unwrapped()).toBe(0);

  store.set(1);

  expect(get(functionStore)()).toBe(1);
  expect(unwrapped()).toBe(1);
});

test('stops listening to store changes when .freeze is called', () => {
  const store = writable(0);
  const functionStore = derived(store, ($store) => () => $store) as Readable<
    () => number
  >;

  const unwrapped = unwrapFunctionStore(functionStore);

  expect(get(functionStore)()).toBe(0);
  expect(unwrapped()).toBe(0);

  store.set(1);

  expect(get(functionStore)()).toBe(1);
  expect(unwrapped()).toBe(1);

  unwrapped.freeze();

  store.set(2);

  expect(get(functionStore)()).toBe(2);
  expect(unwrapped()).toBe(1);
});
