import ts from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'

const PROD = !process.env.ROLLUP_WATCH

export default [
  {
    input: 'src/index.ts',
    output: [
      { file: pkg.module, format: 'es' },
      { file: pkg.main, format: 'cjs' },
    ],
    plugins: [ts(), PROD && terser()],
  },
]
