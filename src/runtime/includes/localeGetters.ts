const getFromQueryString = (queryString: string, key: string) => {
  const keyVal = queryString.split('&').find((i) => i.indexOf(`${key}=`) === 0);

  if (keyVal) {
    return keyVal.split('=').pop();
  }

  return null;
};

const getFirstMatch = (base: string, pattern: RegExp) => {
  const match = pattern.exec(base);

  // istanbul ignore if
  if (!match) return null;

  // istanbul ignore else
  return match[1] || null;
};

export const getLocaleFromHostname = (hostname: RegExp) => {
  // istanbul ignore next
  if (typeof window === 'undefined') return null;

  return getFirstMatch(window.location.hostname, hostname);
};

export const getLocaleFromPathname = (pathname: RegExp) => {
  // istanbul ignore next
  if (typeof window === 'undefined') return null;

  return getFirstMatch(window.location.pathname, pathname);
};

export const getLocaleFromNavigator = () => {
  // istanbul ignore next
  if (typeof window === 'undefined') return null;

  return window.navigator.language || window.navigator.languages[0];
};

export const getLocaleFromQueryString = (search: string) => {
  // istanbul ignore next
  if (typeof window === 'undefined') return null;

  return getFromQueryString(window.location.search.substr(1), search);
};

export const getLocaleFromHash = (hash: string) => {
  // istanbul ignore next
  if (typeof window === 'undefined') return null;

  return getFromQueryString(window.location.hash.substr(1), hash);
};
