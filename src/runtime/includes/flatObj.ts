// could use a reduce, but a simple for-in has less footprint
export const flatObj = (obj: Record<string, any>, prefix = '') => {
  const flatted: Record<string, string> = {};

  for (const key in obj) {
    flatted[prefix + key] = obj[key];
  }

  return flatted;
};
