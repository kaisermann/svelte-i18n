// const extname = require('path').extname
const createFilter = require('rollup-pluginutils').createFilter
const babel = require('babel-core')
const icuPrecompiler = require('babel-plugin-precompile-icu')

/**
 * @param options
 * @param options.include
 * @param options.exclude
 */
export default function(options = {}) {
  const filter = createFilter(options.include, options.exclude)

  return {
    name: 'compile-translations',
    transform: (code, id) => {
      console.log(id)
      if (filter(id)) {
        const { code: newCode } = babel.transform(code, {
          plugins: [icuPrecompiler],
        })
        return { code: newCode, map: { mappings: '' } }
      }
    },
  }
}
