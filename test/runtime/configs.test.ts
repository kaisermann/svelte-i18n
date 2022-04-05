/* eslint-disable node/global-require */
import { get } from 'svelte/store';

import { init, getOptions, defaultFormats } from '../../src/runtime/configs';
import { $locale } from '../../src/runtime/stores/locale';

const warnSpy = jest.spyOn(global.console, 'warn').mockImplementation();

beforeEach(() => {
  warnSpy.mockReset();
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

test('defines default missing key handler if "warnOnMissingMessages" is "true"', () => {
  init({ fallbackLocale: 'en', warnOnMissingMessages: true });
  expect(typeof getOptions().handleMissingMessage).toBe('function');
});

test('warns about using deprecated "warnOnMissingMessages" alongside "handleMissingMessage"', () => {
  init({
    fallbackLocale: 'en',
    warnOnMissingMessages: true,
    handleMissingMessage() {},
  });

  expect(warnSpy).toHaveBeenCalledWith(
    '[svelte-i18n] The "warnOnMissingMessages" option is deprecated. Please use the "handleMissingMessage" option instead.',
  );
});
