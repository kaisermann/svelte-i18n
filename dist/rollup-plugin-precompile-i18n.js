'use strict';

// const extname = require('path').extname
const createFilter = require('rollup-pluginutils').createFilter;
const babel = require('babel-core');
const icuPrecompiler = require('babel-plugin-precompile-icu');

/**
 * @param options
 * @param options.include
 * @param options.exclude
 */
function precompileI18n(options = {}) {
  const filter = createFilter(options.include, options.exclude);

  return {
    name: 'compile-translations',
    transform: (code, id) => {
      if (filter(id)) {
        const { code: newCode } = babel.transform(code, {
          plugins: [icuPrecompiler],
        });
        console.log(`compiled ${id} to: `, newCode);
        return { code: newCode, map: { mappings: '' } }
      }
    },
  }
}

module.exports = precompileI18n;
