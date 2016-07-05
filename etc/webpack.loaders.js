/*eslint-disable*/
/*WEBPACK COMMON LOADERS*/
module.exports = {
  getBabelLoader: function (cx) {
    return {
      test: /\.jsx?$/,
      loader: 'babel-loader',
      include: cx.__sourcedir,
      query: {
        cacheDirectory: true,
        presets: [
          require.resolve('babel-preset-es2015'),
          require.resolve('babel-preset-react'),
        ],
        "env": {
          "development": {
            "presets": [require.resolve('babel-preset-react-hmre')]
          }
        }
      },
    };
  }
}

