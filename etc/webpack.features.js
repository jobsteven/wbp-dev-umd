/*eslint-disable*/
var CleanWebpackPlugin = require('clean-webpack-plugin');
var HTMLWebpackPlugin = require('html-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var OfflinePlugin = require('offline-plugin');
var webpack = require('webpack');
var VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = function(cx, umdConf) {
  return {
    enableEntryHTML: false,

    installEntryHTML: function(entry, options) {
      var mergeOptions = Object.assign({}, {
        filename: (entry || 'index') + '.html',
        template: cx.getCwdPath('./etc/umd.template.html'),
        minify: {
          preserveLineBreaks: false,
          collapseWhitespace: true,
          collapseInlineTagWhitespace: true,
          minifyCSS: true,
          minifyJS: true,
          quoteCharacter: '"',
          removeComments: true,
        },
        chunks: [(entry || 'index')],
        hash: false
      }, options);
      if (umdConf.__vendorAlias) mergeOptions.chunks.unshift(umdConf.__vendorAlias);
      umdConf.addPlugin(new HTMLWebpackPlugin(mergeOptions));
    },

    enableClean: function(absPaths) {
      var mergeAbsPaths = absPaths || [cx.__builddir];
      umdConf.addPlugin(new CleanWebpackPlugin(mergeAbsPaths, {
        root: cx.__cwd
      }))
    },

    enableHistoryfallback: true,

    enableASAR: false,

    enableLESSModule: false,

    enableEntryHot: function(entryName) {
      var webpackHotClient = require.resolve('webpack-hot-middleware/client') + '?reload=true';
      var entryBundle = umdConf.webpackOptions.entry[entryName || 'main'];
      if (entryBundle) {
        entryBundle.unshift(webpackHotClient);
      }
    },

    enableBabelPolyfill: function(entryName) {
      var entryBundle = umdConf.webpackOptions.entry[entryName || 'main'];
      if (entryBundle)
        entryBundle.unshift(require.resolve('babel-polyfill'));
    },

    enableUglifyJs: function(options) {
      var mergeOptions = Object.assign({
        parallel: true,
        sourceMap: false,
        uglifyOptions: {
          output: {
            comments: false,
            beautify: false
          },
          warnings: false
        }
      }, options);

      umdConf.addPlugin(new UglifyJSPlugin(mergeOptions));
    },

    enableVue: true,

    enableVendors: function(options) {
      var mergeOptions = Object.assign({}, {
        name: "vendor",
        minChunks: Infinity,
      }, options)
      umdConf.webpackOptions.entry[mergeOptions.name] = [];
      umdConf.__vendorAlias = mergeOptions.name;
      umdConf.addPlugin(new webpack.optimize.CommonsChunkPlugin(mergeOptions));
    },

    enableCommons: function(options) {
      var mergeOptions = Object.assign({}, {
        name: "commons"
      }, options)
      umdConf.webpackOptions.entry[mergeOptions.name] = [];
      umdConf.addPlugin(new webpack.optimize.CommonsChunkPlugin(mergeOptions));
    },

    enableOffline: false,

    installOffline: function() {
      umdConf.addPlugin(new OfflinePlugin());
      //install offapp
      for (var key in umdConf.pkg.wbp.entries) {
        var entryModules = umdConf.webpackOptions.entry[key];
        if (entryModules) {
          entryModules.push(require.resolve('../lib/offapp.js'));
        }
      }
    },

    enableChuckHash: false,

    installChuckHash: function() {
      const chunkname = umdConf.webpackOptions.output.filename;
      if (chunkname.indexOf('[name]') !== -1) {
        umdConf.webpackOptions.output.filename = chunkname.replace('[name]', '[name]' + (umdConf.devMode ? '_[hash:7]' : '_[chunkhash:7]'));
      }
    },

    enableNode: function(options, target) {
      umdConf.webpackOptions.target = target || 'node';
      umdConf.addExternalNodeModules(options);
    },

    enableDevtool: function(devtoolType = 'eval') {
      umdConf.webpackOptions.devtool = devtoolType;
    },

    enableHits: function(hitsobj) {
      umdConf.webpackOptions.performance = Object.assign({
        hints: 'warning',
        assetFilter: function(assetFilename) {
          return assetFilename.endsWith('.js');
        }
      }, hitsobj);
    }
  };
}
