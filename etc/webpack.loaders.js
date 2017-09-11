/*eslint-disable*/
/*WEBPACK COMMON LOADERS*/
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {

  getJSLoader: function(cx, devMode) {
    return {
      test: /\.jsx?$/,
      include: [cx.__sourcedir, cx.__testdir],
      use: [{
        loader: 'babel-loader',
        query: {
          cacheDirectory: true,
          presets: [
            require.resolve('babel-preset-env'),
            require.resolve('babel-preset-react'),
            require.resolve('babel-preset-stage-0')
          ],
          plugins: [
            [
              require.resolve('babel-plugin-import'),
              { "libraryName": "antd", "style": true }
            ],
            require.resolve("babel-plugin-transform-runtime"),
            require.resolve('react-hot-loader/babel')
          ]
        }
      }, 'webpack-module-hot-accept']
    }
  },

  getLESS_SRCLoader: function(cx, devMode) {
    let use = [{
      loader: 'css-loader',
      options: {
        sourceMap: devMode,
        modules: cx.umdConf.webpackFeatures.enableCSSModule,
        minimize: !devMode,
        localIdentName: '[local]_[hash:base64:5]'
      }
    }, {
      loader: 'postcss-loader',
      options: {
        plugins: (loader) => [
          require('postcss-flexbugs-fixes')(),
          require('autoprefixer')({
            browsers: [
              '>1%',
              'last 4 versions',
              'Firefox ESR',
              'not ie < 9', // React doesn't support IE8 anyway
            ],
            flexbox: 'no-2009',
          }),
        ],
      }
    }, {
      loader: 'less-loader',
      options: {
        modifyVars: {
          '@icon-url': '"../../../../antd-iconfont/iconfont"',
        },
      },
    }]

    if (devMode) {
      use.unshift('style-loader');
    } else {
      use = ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use
      })
    }

    return {
      test: /\.less$/,
      use
    }
  },

  getImgLoader: function(cx, devMode) {
    return {
      test: /\.(jpe?g|png|svg|gif)$/i,
      use: `url-loader?prefix=img&limit=25000&name=[name]${devMode?'':'_[hash:7]'}.[ext]`, //25k
    }
  },

  getFontLoader: function(cx, devMode) {
    return {
      test: /.otf$|\.ttf$|\.eot$|\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'file-loader',
      options: {
        name: `[name]${devMode?'':'_[hash:7]'}.[ext]`
      },
    }
  },

  // getSCSS_SRCLoader: function(cx, devMode) {
  //   return {
  //     test: /\.scss$/,
  //     // include: cx.__sourcedir,
  //     loader: devMode ? 'style-loader!css-loader?localIdentName=[[local]_[hash:base64:5]hash:base64:5]&camelCase&modules&importLoaders=1&minimize!postcss-loader?parser=postcss-scss' : ExtractTextPlugin.extract('style-loader', ['css-loader?camelCase&modules&importLoaders=1&minimize', 'postcss-loader?parser=postcss-scss']),
  //   }
  // },

  getCSSLoader: function(cx, devMode) {
    return {
      test: /\.css$/,
      use: devMode ? ['style-loader', {
        loader: 'css-loader',
        options: {
          minimize: true
        }
      }] : ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: 'css-loader?minimize'
      })
    }
  },

  // getSCSSLoader: function(cx) {
  //   return {
  //     test: /\.scss$/,
  //     // exclude: cx.__sourcedir,
  //     loader: ExtractTextPlugin.extract('style-loader', ['css-loader?importLoaders=1&minimize', 'sass-loader']),
  //   }
  // }

}