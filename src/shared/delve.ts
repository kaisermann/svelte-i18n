export function delve(obj: Record<string, unknown>, fullKey?: string) {
  if (fullKey == null) return undefined;

  if (fullKey in obj) {
    return obj[fullKey];
  }

  const keys = fullKey.split('.');
  let result: any = obj;

  for (let p = 0; p < keys.length; p++) {
    if (typeof result === 'object') {
      if (p > 0) {
        const partialKey = keys.slice(p, keys.length).join('.');

        if (partialKey in result) {
          result = result[partialKey];
          break;
        }
      }

      result = result[keys[p]];
    } else {
      result = undefined;
    }
  }

  return result;
}
