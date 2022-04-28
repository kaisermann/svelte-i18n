/* eslint-disable line-comment-position */
import { get } from 'svelte/store';

import type {
  JSONGetter,
  MessageFormatter,
  TimeFormatter,
  DateFormatter,
  NumberFormatter,
  ConfigureOptions,
  ConfigureOptionsInit,
} from '../../../src/runtime/types';
import {
  $format,
  $formatTime,
  $formatDate,
  $formatNumber,
  $getJSON,
} from '../../../src/runtime/stores/formatters';
import { applyOptions, defaultOptions, getOptions, init } from '../../../src/runtime/configs';
import { addMessages } from '../../../src/runtime/stores/dictionary';
import { $locale } from '../../../src/runtime/stores/locale';
import { createI18nClient, getI18nClientInComponentInit, I18nClient, initLifecycleFuncs,
  setI18nClientInContext, setupI18nClientInComponentInit } from '../../../src/runtime/client';

let formatMessage: MessageFormatter;
let formatTime: TimeFormatter;
let formatDate: DateFormatter;
let formatNumber: NumberFormatter;
let getJSON: JSONGetter;

addMessages('en', require('../../fixtures/en.json'));
addMessages('en-GB', require('../../fixtures/en-GB.json'));
addMessages('pt', require('../../fixtures/pt.json'));
addMessages('pt-BR', require('../../fixtures/pt-BR.json'));
addMessages('pt-PT', require('../../fixtures/pt-PT.json'));

describe('format message', () => {
  function performTest(init: (opts: ConfigureOptionsInit) => void, setLocale: (locale: string | null) => void) {
    it('formats a message by its id and the current locale', () => {
      init({ fallbackLocale: 'en' });

      expect(formatMessage({ id: 'form.field_1_name' })).toBe('Name');
    });

    it('formats a message by its id and the a passed locale', () => {
      expect(formatMessage({ id: 'form.field_1_name', locale: 'pt' })).toBe(
        'Nome',
      );
    });

    it('formats a message with interpolated values', () => {
      init({ fallbackLocale: 'en' });

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
      init({ fallbackLocale: 'en' });

      expect(
        formatMessage({
          id: 'non-existent',
          default: '{food}',
          values: { food: 'potato' },
        }),
      ).toBe('potato');
    });

    it('formats the key with interpolated values', () => {
      init({ fallbackLocale: 'en' });

      expect(
        formatMessage({
          id: '{food}',
          values: { food: 'potato' },
        }),
      ).toBe('potato');
    });

    it('accepts a message id as first argument', () => {
      init({ fallbackLocale: 'en' });

      expect(formatMessage('form.field_1_name')).toBe('Name');
    });

    it('accepts a message id as first argument and formatting options as second', () => {
      init({ fallbackLocale: 'en' });

      expect(formatMessage('form.field_1_name', { locale: 'pt' })).toBe('Nome');
    });

    it('throws if no locale is set', () => {
      init({ fallbackLocale: 'en' });

      setLocale(null);

      expect(() => formatMessage('form.field_1_name')).toThrow(
        '[svelte-i18n] Cannot format a message without first setting the initial locale.',
      );
    });

    it('uses a missing message default value', () => {
      init({ fallbackLocale: 'en' });

      expect(formatMessage('missing', { default: 'Missing Default' })).toBe(
        'Missing Default',
      );
    });

    it('errors out when value found is not string', () => {
      init({ fallbackLocale: 'en' });

      const spy = jest.spyOn(global.console, 'warn').mockImplementation();

      expect(typeof formatMessage('form')).toBe('object');
      expect(spy).toBeCalledWith(
        `[svelte-i18n] Message with id "form" must be of type "string", found: "object". Gettin its value through the "$format" method is deprecated; use the "json" method instead.`,
      );

      spy.mockRestore();
    });

    it('warn on missing messages if "warnOnMissingMessages" is true', () => {
      init({
        fallbackLocale: 'en',
        warnOnMissingMessages: true,
      });

      const spy = jest.spyOn(global.console, 'warn').mockImplementation();

      formatMessage('missing');

      expect(spy).toBeCalledWith(
        `[svelte-i18n] The message "missing" was not found in "en".`,
      );

      spy.mockRestore();
    });

    it('uses result of handleMissingMessage handler', () => {
      init({
        fallbackLocale: 'en',
        handleMissingMessage: () => 'from handler',
      });

      expect(formatMessage('should-default')).toBe('from handler');
    });

    it('does not throw with invalid syntax', () => {
      init({ fallbackLocale: 'en' });

      setLocale('en');
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
  }

  // Running the tests

  describe('Test by the global singleton initialization', () => {
    function cleanInit() {
      const initialConf: ConfigureOptions = JSON.parse(JSON.stringify(defaultOptions));
      delete initialConf.warnOnMissingMessages;
      applyOptions(initialConf, getOptions());
      getOptions().handleMissingMessage = undefined;
    }
    beforeEach(cleanInit);
    afterAll(cleanInit);

    function setLocale(locale: string | null, override: boolean = true) {
      if (override) {
        $locale.set(locale);
      }

      formatMessage = get($format);
      formatTime = get($formatTime);
      formatDate = get($formatDate);
      formatNumber = get($formatNumber);
      getJSON = get($getJSON) as JSONGetter;
    }

    performTest((opts) => { init(opts); setLocale(null, false) }, setLocale);
  });

  function generateSetLocaleFunc(getClient: () => I18nClient | null) {
    //Initial global functions

    formatMessage = get($format);
    formatTime = get($formatTime);
    formatDate = get($formatDate);
    formatNumber = get($formatNumber);
    getJSON = get($getJSON) as JSONGetter;
    
    function setLocale(locale: string | null, override: boolean = true) {
      const client: I18nClient | null = getClient();

      if (override) {
        (client === null ? $locale : client.locale).set(locale);
      }

      formatMessage = get(client === null ? $format : client.format);
      formatTime = get(client === null ? $formatTime : client.time);
      formatDate = get(client === null ? $formatDate : client.date);
      formatNumber = get(client === null ? $formatNumber : client.number);
      getJSON = get(client === null ? $getJSON : client.json) as JSONGetter;
    }

    return setLocale;
  }

  describe('Test by initializing i18n clients', () => {
    let client: I18nClient | null = null;
    
    const setLocale = generateSetLocaleFunc(() => client);

    function init(opts: ConfigureOptionsInit) {
      client = createI18nClient(opts);
      setLocale(get(client.locale) ?? null, false);
    }

    performTest(init, setLocale);
  });

  describe('Test by initializing i18n by setuping "svelte" contexts', () => {
    let client: I18nClient | null = null;
    
    const setLocale = generateSetLocaleFunc(() => client);

    const globalClient = getI18nClientInComponentInit();

    // Testing that lifecycle behaving correctly

    const errorMessage = "Error: Lifecycle functions aren't initialized! Use initLifecycleFuncs() before.";
    expect(setI18nClientInContext).toThrowError(errorMessage);
    expect(setupI18nClientInComponentInit).toThrowError(errorMessage);

    let active: boolean;
    let initCalled: boolean;
    let keyTrack: any;
    let valueTrack: any;
    let onDestroyDo: null | (() => void);
    initLifecycleFuncs({
      hasContext(key: any) {
        return key === keyTrack;
      },
      setContext<T>(key: any, context: T) {
        keyTrack = key;
        valueTrack = context;
        active = true;
      },
      getContext<T>(key: any) {
        expect(active).toBe(true);
        expect(key).toBe(keyTrack);
        return valueTrack;
      },
      onDestroy(fn) {
        expect(onDestroyDo).toBe(null);
        onDestroyDo = fn;
      }
    });

    expect(getI18nClientInComponentInit()).toBe(globalClient);

    function init(opts: ConfigureOptionsInit) {
      expect(active).toBe(false);
      expect(initCalled).toBe(false);

      client = setupI18nClientInComponentInit(opts);
      expect(getI18nClientInComponentInit()).toBe(client);

      setLocale(get(client.locale) ?? null, false);

      expect(active).toBe(true);

      initCalled = true;
    }
    
    beforeEach(() => {
      active = false;
      initCalled = false;
      keyTrack = undefined;
      valueTrack = undefined;
      onDestroyDo = null;
    });

    afterEach(() => {
      if (initCalled) {
        expect(active).toBe(true);

        expect(onDestroyDo).toBeTruthy();
        onDestroyDo!();
      }

      expect(getI18nClientInComponentInit()).toBe(globalClient);
    });

    performTest(init, setLocale);
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
