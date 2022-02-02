import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';

export default {
  input: 'dist/tsc/main/cli.js',
  output: {
    file: 'dist/bundle.cjs',
    format: 'cjs'
  },
  plugins: [
    nodeResolve({ preferBuiltins: false }), // or `true`
    replace({
      "process.env.NODE_ENV": JSON.stringify("development")
    }),
    commonjs(),
    json(),
  ]
}