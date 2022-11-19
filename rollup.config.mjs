import { readFileSync } from 'fs';

import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import ts from '@rollup/plugin-typescript';
import autoExternal from 'rollup-plugin-auto-external';
import dts from 'rollup-plugin-dts';

const pkg = JSON.parse(readFileSync('./package.json'));

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
    plugins: [commonjs(), autoExternal(), ts(), terser()],
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
