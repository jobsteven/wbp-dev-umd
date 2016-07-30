/*eslint-disable*/
var CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = function (cx, umdConf) {
  return {
    enableCleanFeature: function () {
      umdConf.addPlugin(new CleanWebpackPlugin([cx.__builddir], {
        root: cx.__cwd
      }))
    }
  }
};

