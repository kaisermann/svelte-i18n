/* eslint-disable line-comment-position */
import { get } from 'svelte/store';

import type {
  JSONGetter,
  MessageFormatter,
  TimeFormatter,
  DateFormatter,
  NumberFormatter,
  OnMissingMessageHandler,
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
  getJSON = get($getJSON) as JSONGetter;
});

addMessages('en', require('../../fixtures/en.json'));
addMessages('en-GB', require('../../fixtures/en-GB.json'));
addMessages('pt', require('../../fixtures/pt.json'));
addMessages('pt-BR', require('../../fixtures/pt-BR.json'));
addMessages('pt-PT', require('../../fixtures/pt-PT.json'));

let onMissingMessageHandlerCalls: Array<{
  langs: string[];
  id: string;
  defaultValue: string | undefined;
}> = [];

const onMissingMessageHandler = (
  langs: string[],
  id: string,
  defaultValue?: string,
) => {
  onMissingMessageHandlerCalls.push({ lngs, id, defaultValue });
};

beforeEach(() => {
  init({ fallbackLocale: 'en', onMissingMessageHandler });
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
    onMissingMessageHandlerCalls = [];
    expect(
      formatMessage({
        id: 'non-existent',
        default: '{food}',
        values: { food: 'potato' },
      }),
    ).toBe('potato');
    expect(onMissingMessageHandlerCalls).toHaveLength(1);
    expect(onMissingMessageHandlerCalls[0]).toHaveProperty('lngs', ['en']);
    expect(onMissingMessageHandlerCalls[0]).toHaveProperty(
      'id',
      'non-existent',
    );
    expect(onMissingMessageHandlerCalls[0]).toHaveProperty(
      'defaultValue',
      '{food}',
    );
  });

  it('formats the key with interpolated values', () => {
    onMissingMessageHandlerCalls = [];
    expect(
      formatMessage({
        id: '{food}',
        values: { food: 'potato' },
      }),
    ).toBe('potato');
    expect(onMissingMessageHandlerCalls).toHaveLength(1);
    expect(onMissingMessageHandlerCalls[0]).toHaveProperty('lngs', ['en']);
    expect(onMissingMessageHandlerCalls[0]).toHaveProperty('id', '{food}');
    expect(onMissingMessageHandlerCalls[0]).toHaveProperty(
      'defaultValue',
      undefined,
    );
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
    const spy = jest.spyOn(global.console, 'warn').mockImplementation();

    expect(typeof formatMessage('form')).toBe('object');
    expect(spy).toBeCalledWith(
      `[svelte-i18n] Message with id "form" must be of type "string", found: "object". Gettin its value through the "$format" method is deprecated; use the "json" method instead.`,
    );

    spy.mockRestore();
  });

  it('warn on missing messages', () => {
    const spy = jest.spyOn(global.console, 'warn').mockImplementation();

    formatMessage('missing');

    expect(spy).toBeCalledWith(
      `[svelte-i18n] The message "missing" was not found in "en".`,
    );

    spy.mockRestore();
  });

  it('does not throw with invalid syntax', () => {
    $locale.set('en');
    const spy = jest.spyOn(global.console, 'warn').mockImplementation();

    // eslint-disable-next-line line-comment-position
    formatMessage('with-syntax-error', { values: { name: 'John' } });

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining(
        `[svelte-i18n] Message "with-syntax-error" has syntax error:`,
      ),
      expect.anything(),
    );

    spy.mockRestore();
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
