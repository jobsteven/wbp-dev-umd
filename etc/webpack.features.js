/*eslint-disable*/
var CleanWebpackPlugin = require('clean-webpack-plugin');
var HTMLWebpackPlugin = require('html-webpack-plugin');

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
      var entryBundle = this.entry[entryName || 'main'];
      if (entryBundle)
        entryBundle.unshift(webpackHotClient);
    }
  }
};

