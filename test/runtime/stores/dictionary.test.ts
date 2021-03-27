import { get } from 'svelte/store';

import {
  getDictionary,
  hasLocaleDictionary,
  getClosestAvailableLocale,
  getMessageFromDictionary,
  addMessages,
  $dictionary,
  $locales,
  getLocaleDictionary,
} from '../../../src/runtime/stores/dictionary';

beforeEach(() => {
  $dictionary.set({});
});

test('adds a new dictionary to a locale', () => {
  addMessages('en', { field_1: 'name' });
  addMessages('pt', { field_1: 'nome' });

  expect(get($dictionary)).toMatchObject({
    en: { field_1: 'name' },
    pt: { field_1: 'nome' },
  });
});

test('gets the whole current dictionary', () => {
  addMessages('en', { field_1: 'name' });
  expect(getDictionary()).toMatchObject(get($dictionary));
});

test('merges the existing dictionaries with new ones', () => {
  addMessages('en', { field_1: 'name', deep: { prop1: 'foo' } });
  addMessages('en', { field_2: 'lastname', deep: { prop2: 'foo' } });
  addMessages('pt', { field_1: 'nome', deep: { prop1: 'foo' } });
  addMessages('pt', { field_2: 'sobrenome', deep: { prop2: 'foo' } });

  expect(get($dictionary)).toMatchObject({
    en: {
      field_1: 'name',
      field_2: 'lastname',
      deep: { prop1: 'foo', prop2: 'foo' },
    },
    pt: {
      field_1: 'nome',
      field_2: 'sobrenome',
      deep: { prop1: 'foo', prop2: 'foo' },
    },
  });
});

test('gets the dictionary of a locale', () => {
  addMessages('en', { field_1: 'name' });
  expect(getLocaleDictionary('en')).toMatchObject({ field_1: 'name' });
});

test('checks if a locale dictionary exists', () => {
  addMessages('pt', { field_1: 'name' });
  expect(hasLocaleDictionary('en')).toBe(false);
  expect(hasLocaleDictionary('pt')).toBe(true);
});

test('gets the closest available locale', () => {
  addMessages('pt', { field_1: 'name' });
  expect(getClosestAvailableLocale('pt-BR')).toBe('pt');
});

test("returns null if there's no closest locale available", () => {
  addMessages('pt', { field_1: 'name' });
  expect(getClosestAvailableLocale('it-IT')).toBeUndefined();
});

test('lists all locales in the dictionary', () => {
  addMessages('en', {});
  addMessages('pt', {});
  addMessages('pt-BR', {});
  expect(get($locales)).toEqual(['en', 'pt', 'pt-BR']);
});

describe('getting messages', () => {
  it('gets a message from a shallow dictionary', () => {
    addMessages('en', { message: 'Some message' });
    expect(getMessageFromDictionary('en', 'message')).toBe('Some message');
  });

  it('gets a message from a deep object in the dictionary', () => {
    addMessages('en', { messages: { message_1: 'Some message' } });
    expect(getMessageFromDictionary('en', 'messages.message_1')).toBe(
      'Some message',
    );
  });

  it('gets a message from an array in the dictionary', () => {
    addMessages('en', { messages: ['Some message', 'Other message'] });
    expect(getMessageFromDictionary('en', 'messages.0')).toBe('Some message');
    expect(getMessageFromDictionary('en', 'messages.1')).toBe('Other message');
  });

  it('gets a shallow message keyed with dots', () => {
    addMessages('pt', {
      'Hey man. How are you today?': 'E ai cara, como você vai hoje?',
    });
    expect(getMessageFromDictionary('pt', 'Hey man. How are you today?')).toBe(
      'E ai cara, como você vai hoje?',
    );
  });

  it('gets a deep message keyed with dots', () => {
    addMessages('pt', {
      WCAG: {
        SUCCESS_CRITERION: {
          '1.1.1': '1.1.1',
          '1.2.1': '1.2.1',
          '1.3.1': '1.3.1',
          not: null,
        },
      },
    });

    expect(getMessageFromDictionary('pt', 'WCAG.SUCCESS_CRITERION.1.3.1')).toBe(
      '1.3.1',
    );
    expect(
      getMessageFromDictionary('pt', 'WCAG.SUCCESS_CRITERION.not'),
    ).toBeNull();
    expect(
      getMessageFromDictionary(
        'pt',
        'WCAG.SUCCESS_CRITERION.1.3.1.not.existing',
      ),
    ).toBeUndefined();
  });

  it('returns undefined for missing messages', () => {
    addMessages('en', {});
    expect(getMessageFromDictionary('en', 'foo.potato')).toBeUndefined();
  });
});
