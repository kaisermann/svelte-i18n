import {
  getLocaleFromQueryString,
  getLocaleFromHash,
  getLocaleFromNavigator,
  getLocaleFromPathname,
  getLocaleFromHostname,
} from '../../../src/runtime/modules/localeGetters';

describe('getting client locale', () => {
  beforeEach(() => {
    // @ts-expect-error - TS doesn't know this is a fake window object
    delete window.location;

    // @ts-expect-error - TS doesn't know this is a fake window object
    window.location = {
      pathname: '/',
      hostname: 'example.com',
      hash: '',
      search: '',
    };
  });

  it('gets the locale based on the passed hash parameter', () => {
    window.location.hash = '#locale=en-US&lang=pt-BR';
    expect(getLocaleFromHash('lang')).toBe('pt-BR');
  });

  it('gets the locale based on the passed search parameter', () => {
    window.location.search = '?locale=en-US&lang=pt-BR';
    expect(getLocaleFromQueryString('lang')).toBe('pt-BR');
  });

  it('gets the locale based on the navigator language', () => {
    expect(getLocaleFromNavigator()).toBe(window.navigator.language);
  });

  it('gets the locale based on the pathname', () => {
    window.location.pathname = '/en-US/foo/';
    expect(getLocaleFromPathname(/^\/(.*?)\//)).toBe('en-US');
  });

  it('gets the locale base on the hostname', () => {
    window.location.hostname = 'pt.example.com';
    expect(getLocaleFromHostname(/^(.*?)\./)).toBe('pt');
  });

  it('returns null if no locale was found', () => {
    expect(getLocaleFromQueryString('lang')).toBeNull();
  });
});
