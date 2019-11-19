import commonjs from 'rollup-plugin-commonjs'
import ts from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import autoExternal from 'rollup-plugin-auto-external'

import pkg from './package.json'

const PROD = !process.env.ROLLUP_WATCH

// const externals = new Set([
//   ...Object.keys(pkg.dependencies),
//   ...Object.keys(pkg.peerDependencies),
//   'fs',
//   'path',
// ])

export default [
  {
    input: 'src/client/index.ts',
    external: [
      ...Object.keys(pkg.dependencies),
      ...Object.keys(pkg.peerDependencies),
      'svelte/store',
    ],
    output: [
      { file: pkg.module, format: 'es' },
      { file: pkg.main, format: 'cjs' },
    ],
    plugins: [commonjs(), autoExternal(), ts(), PROD && terser()],
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
]
