import { writable, Writable } from 'svelte/store';

export function createLoadingStore() : Writable<boolean> {
  return writable(false);
}

export const $isLoading = createLoadingStore();
