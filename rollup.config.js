import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from "rollup-plugin-terser";

import pkg from './package.json';

const plugins =  [
  resolve(),
  commonjs(),
  terser()
]

export default [
	// browser-friendly UMD build
	{
		input: 'src/index.js',
		output: {
			name: 'svelteI18n',
			file: pkg.browser,
			format: 'umd'
    },
    plugins
	},
	{
		input: 'src/index.js',
		external: [...Object.keys(pkg.dependencies), 'svelte/store'],
		output: [
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' }
    ],
    plugins
	}
];