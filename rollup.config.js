import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'

const plugins = [resolve(), commonjs(), terser()]

export default [
  {
    input: 'src/index.js',
    external: [
      ...Object.keys(pkg.dependencies),
      ...Object.keys(pkg.peerDependencies),
      'svelte/store',
    ],
    output: [
      { file: pkg.module, format: 'es' },
      { file: pkg.main, format: 'cjs' },
    ],
    plugins,
  },
  {
    input: 'src/cli/index.js',
    external: [
      ...Object.keys(pkg.dependencies),
      ...Object.keys(pkg.peerDependencies),
      'svelte/store',
    ],
    output: [{ file: pkg.bin['svelte-i18n'], name: 'cli.js', format: 'cjs' }],
    plugins,
  },
]
