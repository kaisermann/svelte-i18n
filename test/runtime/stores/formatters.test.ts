import { get } from 'svelte/store';

import type {
  JSONGetter,
  MessageFormatter,
  TimeFormatter,
  DateFormatter,
  NumberFormatter,
} from '../../../src/runtime/types/index';
import {
  $format,
  $formatTime,
  $formatDate,
  $formatNumber,
  $getJSON,
} from '../../../src/runtime/stores/formatters';
import { init } from '../../../src/runtime/configs';
import { addMessages } from '../../../src/runtime/stores/dictionary';
import { $locale } from '../../../src/runtime/stores/locale';

let formatMessage: MessageFormatter;
let formatTime: TimeFormatter;
let formatDate: DateFormatter;
let formatNumber: NumberFormatter;
let getJSON: JSONGetter;

$locale.subscribe(() => {
  formatMessage = get($format);
  formatTime = get($formatTime);
  formatDate = get($formatDate);
  formatNumber = get($formatNumber);
  getJSON = get($getJSON);
});

addMessages('en', require('../../fixtures/en.json'));
addMessages('en-GB', require('../../fixtures/en-GB.json'));
addMessages('pt', require('../../fixtures/pt.json'));
addMessages('pt-BR', require('../../fixtures/pt-BR.json'));
addMessages('pt-PT', require('../../fixtures/pt-PT.json'));

beforeEach(() => {
  init({ fallbackLocale: 'en' });
});

describe('format message', () => {
  it('formats a message by its id and the current locale', () => {
    expect(formatMessage({ id: 'form.field_1_name' })).toBe('Name');
  });

  it('formats a message by its id and the a passed locale', () => {
    expect(formatMessage({ id: 'form.field_1_name', locale: 'pt' })).toBe(
      'Nome',
    );
  });

  it('formats a message with interpolated values', () => {
    expect(formatMessage({ id: 'photos', values: { n: 0 } })).toBe(
      'You have no photos.',
    );
    expect(formatMessage({ id: 'photos', values: { n: 1 } })).toBe(
      'You have one photo.',
    );
    expect(formatMessage({ id: 'photos', values: { n: 21 } })).toBe(
      'You have 21 photos.',
    );
  });

  it('formats the default value with interpolated values', () => {
    expect(
      formatMessage({
        id: 'non-existent',
        default: '{food}',
        values: { food: 'potato' },
      }),
    ).toBe('potato');
  });

  it('formats the key with interpolated values', () => {
    expect(
      formatMessage({
        id: '{food}',
        values: { food: 'potato' },
      }),
    ).toBe('potato');
  });

  it('accepts a message id as first argument', () => {
    expect(formatMessage('form.field_1_name')).toBe('Name');
  });

  it('accepts a message id as first argument and formatting options as second', () => {
    expect(formatMessage('form.field_1_name', { locale: 'pt' })).toBe('Nome');
  });

  it('throws if no locale is set', () => {
    $locale.set(null);
    expect(() => formatMessage('form.field_1_name')).toThrow(
      '[svelte-i18n] Cannot format a message without first setting the initial locale.',
    );
  });

  it('uses a missing message default value', () => {
    expect(formatMessage('missing', { default: 'Missing Default' })).toBe(
      'Missing Default',
    );
  });

  it('errors out when value found is not string', () => {
    const { warn } = global.console;

    jest.spyOn(global.console, 'warn').mockImplementation();

    expect(typeof formatMessage('form')).toBe('object');
    expect(console.warn).toBeCalledWith(
      `[svelte-i18n] Message with id "form" must be of type "string", found: "object". Gettin its value through the "$format" method is deprecated; use the "json" method instead.`,
    );

    global.console.warn = warn;
  });

  it('warn on missing messages', () => {
    const { warn } = global.console;

    jest.spyOn(global.console, 'warn').mockImplementation();

    formatMessage('missing');

    expect(console.warn).toBeCalledWith(
      `[svelte-i18n] The message "missing" was not found in "en".`,
    );

    global.console.warn = warn;
  });
});

test('format time', () => {
  expect(formatTime(new Date(2019, 0, 1, 20, 37))).toBe('8:37 PM');
});

test('format date', () => {
  expect(formatDate(new Date(2019, 0, 1, 20, 37))).toBe('1/1/19');
});

test('format number', () => {
  expect(formatNumber(123123123)).toBe('123,123,123');
});

test('get raw JSON data from the current locale dictionary', () => {
  expect(getJSON('form')).toMatchObject({
    field_1_name: 'Name',
    field_2_name: 'Lastname',
  });
  expect(getJSON('non-existing')).toBeUndefined();
});
