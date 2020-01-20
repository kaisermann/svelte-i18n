import commonjs from 'rollup-plugin-commonjs'
import ts from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import autoExternal from 'rollup-plugin-auto-external'

import pkg from './package.json'

const PROD = !process.env.ROLLUP_WATCH

export default [
  {
    input: 'src/client/index.ts',
    external: [],
    output: [
      { file: pkg.module, format: 'es' },
      { file: pkg.main, format: 'cjs' },
    ],
    plugins: [
      commonjs(),
      autoExternal(),
      ts(),
      PROD && terser()
    ],
  },
  {
    input: 'src/cli/index.ts',

    // external: id => {
    //   if (id.startsWith('/')) return false
    //   return externals.has(id) || id.match(/svelte/gi)
    // },
    output: [
      {
        file: pkg.bin['svelte-i18n'],
        name: 'cli.js',
        format: 'cjs',
        banner: `#!/usr/bin/env node`,
      },
    ],
    plugins: [autoExternal(), commonjs(), ts(), PROD && terser()],
  },
  {
    input: 'src/rollup-plugin/precompile-intl.js',
    output: [
      {
        file: pkg.rollupPlugin,
        name: 'rollup-plugin-precompile-intl.js',
        format: 'cjs',
      },
    ],
    plugins: [commonjs()]
  },
]
