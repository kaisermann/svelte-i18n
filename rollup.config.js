import commonjs from '@rollup/plugin-commonjs';
import ts from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import autoExternal from 'rollup-plugin-auto-external';
import dts from 'rollup-plugin-dts';

import pkg from './package.json';

const PROD = !process.env.ROLLUP_WATCH;

export default [
  // bundle runtime
  {
    input: 'src/runtime/index.ts',
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
  // bundle types for runtime
  {
    input: 'src/runtime/index.ts',
    output: [{ file: pkg.types, format: 'es' }],
    plugins: [dts()],
  },
  // build CLI
  {
    input: 'src/cli/index.ts',
    output: [
      {
        file: pkg.bin['svelte-i18n'],
        name: 'cli.js',
        format: 'cjs',
        banner: `#!/usr/bin/env node`,
      },
    ],
    plugins: [autoExternal(), commonjs(), ts()],
  },
];
