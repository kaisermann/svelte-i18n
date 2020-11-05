import { get } from 'svelte/store';

import {
  init,
  getOptions,
  defaultOptions,
  defaultFormats,
} from '../../src/runtime/configs';
import { $locale } from '../../src/runtime/stores/locale';

beforeEach(() => {
  init(defaultOptions);
});

test('inits the fallback locale', () => {
  expect(getOptions().fallbackLocale).toBeNull();
  init({
    fallbackLocale: 'en',
  });
  expect(getOptions().fallbackLocale).toBe('en');
});

test('inits the initial locale by string', () => {
  init({
    fallbackLocale: 'pt',
    initialLocale: 'en',
  });
  expect(getOptions().initialLocale).toBe('en');
  expect(get($locale)).toBe('en');
});

test('adds custom formats for time, date and number values', () => {
  const customFormats = require('../fixtures/formats.json');

  init({
    fallbackLocale: 'en',
    formats: customFormats,
  });
  expect(getOptions().formats).toMatchObject(defaultFormats);
  expect(getOptions().formats).toMatchObject(customFormats);
});

test('sets the minimum delay to set the loading store value', () => {
  init({ fallbackLocale: 'en', loadingDelay: 300 });
  expect(getOptions().loadingDelay).toBe(300);
});
