import type { Readable } from 'svelte/store';

type UnwrapStore<T> = T extends Readable<infer U> ? U : T;

/**
 * Unwraps a function from a store and make it function calleable easily outside of a Svelte component.
 *
 * It works by creating a subscription to the store and getting local reference to the store value.
 * Then when the returned function is called, it will execute the function by using the local reference.
 *
 * The returned function has a 'freeze' method that will stop listening to the store.
 *
 * @example
 * // some-js-file.js
 * import { format } from 'svelte-i18n';
 *
 * const $format = unwrapFunctionStore(format);
 *
 * console.log($format('hello', { name: 'John' }));
 *
 */
export function unwrapFunctionStore<
  S extends Readable<(...args: any[]) => any>,
  Fn extends UnwrapStore<S>,
>(
  store: S,
): Fn & {
  /**
   * Stops listening to the store.
   */
  freeze: () => void;
} {
  let localReference: Fn;

  const cancel = store.subscribe((value) => (localReference = value as Fn));

  const fn = (...args: Parameters<Fn>) => localReference(...args);

  fn.freeze = cancel;

  return fn as Fn & { freeze: () => void };
}
