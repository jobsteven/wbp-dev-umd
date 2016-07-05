/*eslint-disable*/
var webpack = require('webpack');
var WebpackDevServer = require("webpack-dev-server");
var fs = require('promisify-fs');
var webpackLoaders = require('../etc/webpack.loaders.js');
var path = require('path');
var Promise = require('bluebird');

/**
 * __loadLocalWebpackSetting support local modification.
 * @return promise
 */
function __loadLocalWebpackSetting(umdConf) {
  var localWebpackConf = null;
  try {
    localWebpackConf = require(cx.__cwd + '/webpack.config.js');
  } catch (e) {}
  if (localWebpackConf && localWebpackConf instanceof Function) {
    try {
      localWebpackConf(umdConf, cx);
    } catch (e) {
      cx.warn('Load local webpack config. error occurs.');
    }
  } else {
    cx.info('Ignore local webpack config. Does not exists or without exporting a function.');
  }
}

function __loadWebpackConfig() {
  return fs
    .readJSON(cx.getCwdPath('./package.json'))
    .get('wbp')
    .then(function (wbp) {
      var umdConf = require(cx.__plugindir + '/etc/webpack.config.umd.js');
      //project paths
      cx.__sourcedir = cx.getCwdPath(wbp.source || './src');
      cx.__builddir = cx.getCwdPath(wbp.build || './dist');
      cx.__pluginDependencesDir = cx.__plugindir + '/node_modules';

      //default umd settings
      umdConf.addPlugin(new webpack.HotModuleReplacementPlugin());
      umdConf.addModuleLoader(webpackLoaders.getBabelLoader(cx));
      umdConf.addLoaderSearchPath(cx.__pluginDependencesDir);

      //local setting support
      __loadLocalWebpackSetting(umdConf);

      //umd settings
      umdConf.setContext(cx.__cwd);

      //umd build path
      umdConf.setBuildPath(cx.__builddir);

      //entires
      for (var key in wbp.entries) {
        umdConf.addBundleEntry(key, cx.getCwdPath(wbp.entries[key]));
      }

      return umdConf;
    })
}

/**
 * __webpackDevServer
 * @param  {webpack} compiler
 * @return {promise}
 */
function __webpackDevServer(compiler, umdConf) {
  return Promise.try(function () {
    var devServer = umdConf.devServer;
    var server = new WebpackDevServer(compiler, {
      // webpack-dev-server options
      contentBase: umdConf.output.path,

      // webpack-dev-middleware options
      quiet: true,
      hot: true,

      // webpack compiler callback output options
      watchOptions: {
        aggregateTimeout: 100,
      },
      stats: {
        colors: true,
        chunks: false,
      }
    });
    //start dev server
    server.listen(devServer.port, devServer.host, function () {
      cx.info('DevServer: ' + devServer.host + ':' + devServer.port + ' ');
    });
  })
}

/**
 * plugin context
 */
var context, cx;

/**
 * wbp plugin context (cx)
 * @param {string}  __plugindir  plugin's absolute path
 * @param {string}  __cwd        working directory
 * @param {string}  __name       current plugin's name
 * @param {string}  info         utils log info
 * @param {string}  warn         utils log warn
 * @param {string}  error        utils log error
 * @param {function}  call       wbp plugin-call interface
 */
module.exports = function main(params, options) {
  context = cx = this;
  return __loadWebpackConfig()
    .then(function (umdConf) {
      return [webpack(umdConf), umdConf]
    })
    .spread(function (compiler, umdConf) {
      return __webpackDevServer(compiler, umdConf);
    })
}

