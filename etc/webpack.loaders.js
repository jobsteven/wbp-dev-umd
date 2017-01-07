/*eslint-disable*/
/*WEBPACK COMMON LOADERS*/
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  getJSLoader: function (cx) {
    return {
      test: /\.jsx?$/,
      include: cx.__sourcedir,
      loader: 'babel-loader',
      query: {
        cacheDirectory: true,
        presets: [
          require.resolve('babel-preset-latest'),
          require.resolve('babel-preset-stage-0'),
          require.resolve('babel-preset-react')
        ],
        plugins: [
          require.resolve('react-hot-loader/babel'), [
            require.resolve('babel-plugin-import'), [{
              "libraryName": "antd",
              "style": true
            }]
          ]
        ]
      }
    }
  },
  getImgLoader: function (cx) {
    return {
      test: /\.(jpe?g|png|svg|gif)$/i,
      loader: 'url?prefix=img&limit=25000&name=[name].[ext]', //25k
      include: cx.__sourcedir
    }
  },
  getFontLoader: function (cx) {
    return {
      test: /\.ttf$|\.eot$|\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'file',
      include: cx.__sourcedir,
      query: {
        name: 'font/[name].[ext]'
      },
    }
  },
  getSCSS_SRCLoader: function (cx, devMode) {
    return {
      test: /\.scss$/,
      include: cx.__sourcedir,
      loader: devMode ? 'style!css?localIdentName=[local]_[hash:base64:5]&camelCase&modules&importLoaders=1&minimize!postcss-loader?parser=postcss-scss' : ExtractTextPlugin.extract('style', ['css?camelCase&modules&importLoaders=1&minimize', 'postcss-loader?parser=postcss-scss']),
    }
  },
  getLESS_SRCLoader: function (cx, devMode) {
    return {
      test: /\.less$/,
      include: cx.__sourcedir,
      loader: devMode ? 'style!css?localIdentName=[local]_[hash:base64:5]&camelCase&modules&importLoaders=1&minimize!postcss-loader?parser=postcss-less' : ExtractTextPlugin.extract('style', ['css?camelCase&modules&importLoaders=1&minimize', 'postcss-loader?parser=postcss-less']),
    }
  },
  getSCSSLoader: function (cx) {
    return {
      test: /\.scss$/,
      exclude: cx.__sourcedir,
      loader: ExtractTextPlugin.extract('style', ['css?importLoaders=1&minimize', 'sass-loader']),
    }
  },
  getLESSLoader: function (cx) {
    return {
      test: /\.less$/,
      exclude: cx.__sourcedir,
      loader: ExtractTextPlugin.extract('style', ['css?importLoaders=1&minimize', 'less-loader']),
    }
  },
  getCSSLoader: function (cx, devMode) {
    return {
      test: /\.css$/,
      loader: devMode ? 'style!css?minimize' : ExtractTextPlugin.extract('style', 'css?minimize')
    }
  }
}

