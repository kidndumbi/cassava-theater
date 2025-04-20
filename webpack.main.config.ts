import type { Configuration } from 'webpack';
import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';
// import path from 'path';

// // eslint-disable-next-line @typescript-eslint/no-var-requires
// const CopyWebpackPlugin = require('copy-webpack-plugin');

export const mainConfig: Configuration = {
  entry: './src/index.ts',
  module: {
    rules,
  },
  plugins: [
    ...plugins,
    // new CopyWebpackPlugin({
    //   patterns: [
    //     {
    //       from: path.resolve(__dirname, 'node_modules/classic-level/prebuilds/win32-x64/node.napi.node'),
    //       to: path.resolve(__dirname, '.webpack/main/node_modules/classic-level/prebuilds/win32-x64/node.napi.node'),
    //     },
    //     // Add other platforms as needed
    //   ],
    // }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    // Add these fallbacks for LevelDB dependencies
    fallback: {
      "buffer": require.resolve("buffer/"),
      "stream": require.resolve("stream-browserify"),
      "util": require.resolve("util/"),
      "assert": require.resolve("assert/")
    }
  },
  // Add externals configuration to prevent Webpack from bundling these
  externals: [
    'level',
    'classic-level',
    'abstract-level',
    'bufferutil',
    'utf-8-validate'
  ],
  // Important for native modules
  target: 'electron-main',
  node: {
    __dirname: false,
    __filename: false
  }
};