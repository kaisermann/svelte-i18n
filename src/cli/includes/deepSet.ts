/* eslint-disable no-multi-assign */
/* eslint-disable no-return-assign */
const isNumberString = (n: string) => !Number.isNaN(parseInt(n, 10));

export function deepSet(obj: any, path: string, value: any) {
  const parts = path.replace(/\[(\w+)\]/gi, '.$1').split('.');

  return parts.reduce((ref, part, i) => {
    if (part in ref) return (ref = ref[part]);

    if (i < parts.length - 1) {
      if (isNumberString(parts[i + 1])) {
        return (ref = ref[part] = []);
      }

      return (ref = ref[part] = {});
    }

    return (ref[part] = value);
  }, obj);
}
