const webpack = require("webpack");

module.exports = function override(config, env) {
  // Add fallbacks
  config.resolve.fallback = {
    ...config.resolve.fallback,
    vm: require.resolve("vm-browserify"), // Add this line to fix the vm warning
    path: false,
    http: false,
    https: false,
    stream: require.resolve("stream-browserify"), // Recommended to add browserify version
    crypto: require.resolve("crypto-browserify"), // Recommended to add browserify version
    zlib: false,
    querystring: false,
    fs: false,
    net: false,
    tls: false,
    express: false,
  };

  // Add plugins for browserify polyfills
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ];

  // Add externals to prevent Express from bundling
  config.externals = {
    ...config.externals,
    express: "commonjs express",
  };

  return config;
};
