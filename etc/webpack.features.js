/*eslint-disable*/
var CleanWebpackPlugin = require('clean-webpack-plugin');
var HTMLWebpackPlugin = require('html-webpack-plugin');

module.exports = function (cx, umdConf) {
  return {
    enableCleanFeature: function () {
      umdConf.addPlugin(new CleanWebpackPlugin([cx.__builddir], {
        root: cx.__cwd
      }))
    },
    enableEntryHTML: function (file_name) {
      umdConf.addPlugin(new HTMLWebpackPlugin({
        filename: file_name || 'index.html',
        template: cx.getCwdPath('./etc/umd.template.html')
      }));
    }
  }
};

