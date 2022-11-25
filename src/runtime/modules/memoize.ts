// eslint-disable-next-line @typescript-eslint/ban-types
type MemoizedFunction = <F extends Function>(fn: F) => F;

const monadicMemoize: MemoizedFunction = (fn) => {
  const cache = Object.create(null);
  const memoizedFn: any = (arg: unknown) => {
    const cacheKey = JSON.stringify(arg);

    if (cacheKey in cache) {
      return cache[cacheKey];
    }

    return (cache[cacheKey] = fn(arg));
  };

  return memoizedFn;
};

export { monadicMemoize };
