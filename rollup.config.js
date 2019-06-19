import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'

const plugins = [resolve(), commonjs(), terser()]

export default [
  {
    input: 'src/index.js',
    external: [...Object.keys(pkg.dependencies), 'svelte/store'],
    outpfut: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' },
    ],
    plugins,
  },
]
