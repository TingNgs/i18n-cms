const webpack = require('webpack');

module.exports = function override(config) {
  //do stuff with the webpack config...
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer']
    })
  ];

  config.resolve = {
    ...config.resolve,
    fallback: {
      ...config.resolve.fallback,
      buffer: require.resolve('buffer'),
      url: require.resolve('url'),
      path: require.resolve('path-browserify')
    }
  };
  config.ignoreWarnings = [
    ...(config.ignoreWarnings || []),
    /node_modules\/bitbucket/
  ];
  return config;
};
