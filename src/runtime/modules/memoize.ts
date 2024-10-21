type MemoizedFunction<T, R> = (arg: T) => R;

const monadicMemoize = <T, R>(
  fn: MemoizedFunction<T, R>,
): MemoizedFunction<T, R> => {
  const cache = Object.create(null);

  return (arg) => {
    const cacheKey = JSON.stringify(arg);

    if (cacheKey in cache) {
      return cache[cacheKey];
    }

    return (cache[cacheKey] = fn(arg));
  };
};

export { monadicMemoize };
