/*eslint-disable*/
var combineLoader = require('combineLoader');

/*WEBPACK COMMON LOADERS*/
module.exports = {
  getJSLoader: function (cx) {
    return {
      test: /\.jsx?$/,
      include: cx.__sourcedir,
      loader: combineLoader([{
        loader: 'react-hot'
      }, {
        loader: 'babel-loader',
        query: {
          cacheDirectory: true,
          presets: [
            require.resolve('babel-preset-es2015'),
            require.resolve('babel-preset-react'),
          ]
        }
      }])
    }
  },
  getImgLoader: function (cx) {
    return {
      test: /\.(jpe?g|png|svg|gif)$/i,
      loader: 'url?prefix=img&limit=25000&name=[name].[ext]', //25k
      include: cx.__sourcedir
    }
  },
  getCSSLoader: function (cx) {
    return {
      test: /\.css$/,
      loaders: ['style', 'css'],
    }
  },
  getLessLoader: function (cx) {
    return {
      test: /\.less$/,
      loaders: ['style', 'css', 'less'],
    }
  },
  getPostCSSLoader: function (cx) {
    return {
      test: /\.css$/,
      loaders: ['style', 'css', 'postcss'],
    }
  },
  getCSSNextLoader: function (cx) {
    return {
      test: /\.css$/,
      loaders: ['style', 'css', 'cssnext'],
    }
  },
  getFontLoader: function (cx) {
    return {
      test: /\.ttf$|\.eot$|\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'file',
      query: {
        name: 'font/[name].[ext]'
      },
    }
  }
}

