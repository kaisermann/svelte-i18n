import { readFileSync } from 'fs';

import commonjs from '@rollup/plugin-commonjs';
import autoExternal from 'rollup-plugin-auto-external';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';

const pkg = JSON.parse(readFileSync('./package.json'));

const external = [
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.peerDependencies),
  'svelte/compiler',
  'svelte/store',
];

export default [
  // bundle runtime
  {
    input: 'src/runtime/index.ts',
    output: [{ file: pkg.main, format: 'es' }],
    external,
    plugins: [commonjs(), autoExternal(), esbuild()],
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
        format: 'es',
        banner: `#!/usr/bin/env node`,
      },
    ],
    external,
    plugins: [autoExternal(), commonjs(), esbuild()],
  },
];
