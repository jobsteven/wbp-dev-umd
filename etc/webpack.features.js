/*eslint-disable*/
var CleanWebpackPlugin = require('clean-webpack-plugin');
var HTMLWebpackPlugin = require('html-webpack-plugin');
var OfflinePlugin = require('offline-plugin');
var webpack = require('webpack');

module.exports = function (cx, umdConf) {
  return {
    enableClean: function (absPaths) {
      var mergeAbsPaths = absPaths || [cx.__builddir];
      umdConf.addPlugin(new CleanWebpackPlugin(mergeAbsPaths, {
        root: cx.__cwd
      }))
    },

    enableEntryHTML: function (options) {
      var mergeOptions = Object.assign({}, {
        filename: 'index.html',
        template: cx.getCwdPath('./etc/umd.template.html'),
        minify: {
          preserveLineBreaks: false,
          collapseWhitespace: true,
          collapseInlineTagWhitespace: true,
          minifyCSS: true,
          minifyJS: true,
          quoteCharacter: '"',
          removeComments: true
        },
        hash: true
      }, options);
      umdConf.addPlugin(new HTMLWebpackPlugin(mergeOptions));
    },

    enableEntryHot: function (entryName) {
      var webpackHotClient = require.resolve('webpack-hot-middleware/client') + '?reload=true';
      var entryBundle = umdConf.entry[entryName || 'main'];
      if (entryBundle)
        entryBundle.unshift(webpackHotClient);
    },

    enableUglifyJs: function (options) {
      var mergeOptions = Object.assign({}, { sourceMap: false, comments: false }, options)
      umdConf.addPlugin(new webpack.optimize.UglifyJsPlugin(mergeOptions))
    },

    enableVendors: function (options) {
      var mergeOptions = Object.assign({}, {
        name: "vendor",
        minChunks: Infinity,
      }, options)
      umdConf.entry[mergeOptions.name] = [];
      umdConf.addPlugin(new webpack.optimize.CommonsChunkPlugin(mergeOptions));
    },

    enableLibraries: function (options) {
      var mergeOptions = Object.assign({}, {
        name: "libs",
        children: true,
        async: true
      }, options)
      umdConf.addPlugin(new webpack.optimize.CommonsChunkPlugin(mergeOptions));
    },

    enableOffline: function () {
      umdConf.addPlugin(new OfflinePlugin());
    }
  };
}

