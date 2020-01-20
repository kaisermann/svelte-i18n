'use strict';

// const extname = require('path').extname
const createFilter = require('rollup-pluginutils').createFilter;
const babel = require('babel-core');
const intlPrecompiler = require('babel-plugin-precompile-intl');

/**
 * @param options
 * @param options.include
 * @param options.exclude
 */
function precompileIntl(options = {}) {
  const filter = createFilter(options.include, options.exclude);

  return {
    name: 'compile-translations',
    transform: (code, id) => {
      if (filter(id)) {
        const { code: newCode } = babel.transform(code, {
          plugins: [intlPrecompiler],
        });
        return { code: newCode, map: { mappings: '' } }
      }
    },
  }
}

module.exports = precompileIntl;
