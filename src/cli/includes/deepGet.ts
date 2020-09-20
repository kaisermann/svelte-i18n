export const deepGet = (o: Record<string, any>, id: string) => {
  return id.split('.').reduce((acc, path) => {
    if (typeof acc !== 'object') {
      return acc;
    }

    return acc[path];
  }, o);
};
