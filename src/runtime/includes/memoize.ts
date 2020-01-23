type MemoizedFunction = <F extends any>(fn: F) => F

const monadicMemoize: MemoizedFunction = fn => {
  const cache = Object.create(null)
  const memoizedFn: any = (arg: unknown) => {
    const cacheKey = JSON.stringify(arg)
    if (cacheKey in cache) {
      return cache[cacheKey]
    }
    return (cache[cacheKey] = fn(arg))
  }
  return memoizedFn
}
export { monadicMemoize }
