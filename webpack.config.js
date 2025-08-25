const webpack = require('webpack');
const path = require('path');

module.exports = {
   resolve: {
    extensions: ['.js', '.jsx', '.json'],
    fallback: {
      "path": require.resolve("path-browserify"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "stream": require.resolve("stream-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "zlib": require.resolve("browserify-zlib"),
      "querystring": require.resolve("querystring-es3"),
      "buffer": require.resolve("buffer/"),
      "os": require.resolve("os-browserify/browser"),
      "util": require.resolve("util/"),
      "assert": require.resolve("assert/"),
      "fs": false,
      "net": false,
      "tls": false,
      "dns": false,
      "child_process": false
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.browser': true
    })
  ],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false
        }
      }
    ]
  }
};