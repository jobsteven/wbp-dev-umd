var ExtractTextPlugin = require("extract-text-webpack-plugin");
var VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  getJSLoader: function(cx, devMode) {
    return {
      test: /\.jsx?$/,
      include: [cx.__sourcedir],
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
      }]
    }
  },

  getVueLoader: function(cx, devMode) {
    cx.umdConf.addPlugin(new VueLoaderPlugin())

    return {
      test: /\.vue$/,
      include: [cx.__sourcedir],
      loader: 'vue-loader'
    }
  },

  getCSSLoader: function(cx, devMode) {
    let use = [{
      loader: 'css-loader',
      options: Object.assign({
        sourceMap: devMode,
        minimize: !devMode,
        modules: false,
        url: false
      })
    }];
    if (devMode) {
      use.unshift('style-loader');
    } else {
      use = ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use
      })
    }
    return { test: /\.css$/, use }
  },

  getLESS_SRCLoader: function(cx, devMode) {
    let use = [{
      loader: 'css-loader',
      options: Object.assign({
        sourceMap: devMode,
        minimize: !devMode,
        localIdentName: '[local]_[hash:base64:5]',
        modules: false,
      }, cx.umdConf.webpackFeatures.enableLESSModule)
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
    return { test: /\.less$/, use }
  },

  // 25k
  getImgLoader: function(cx, devMode) {
    return {
      test: /\.(jpe?g|png|svg|gif)$/i,
      use: `url-loader?prefix=img&limit=25000&name=[name]${devMode?'':'_[hash:7]'}.[ext]`,
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
  }
}
