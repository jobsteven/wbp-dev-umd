/*eslint-disable*/
var webpack = require('webpack');
var expressServer = require('express')();
var getWebpackDevMiddleware = require('webpack-dev-middleware');
var getWebpackHotMiddleware = require('webpack-hot-middleware');
var HTMLWebpackPlugin = require('html-webpack-plugin');
var fs = require('promisify-fs');
var webpackLoaders = require('../etc/webpack.loaders.js');
var path = require('path');
var Promise = require('bluebird');

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
  return getWebpackCompiler()
    .then(function () {
      return mountWebpackMiddles();
    })
    .then(function () {
      //start dev server
      return expressServer.listen(cx.umdConf.devServer.port, cx.umdConf.devServer.host, function () {
        cx.info('DevServer: ' + cx.umdConf.devServer.host + ':' + cx.umdConf.devServer.port + ' ');
      });
    })
}

/**
 * getWebpackCompiler which support local modification
 * @method getWebpackCompiler
 * @return {[type]}
 */
function getWebpackCompiler() {
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
      umdConf.addPlugin(new webpack.optimize.OccurrenceOrderPlugin());
      umdConf.addPlugin(new HTMLWebpackPlugin());

      //loaders
      umdConf.addModuleLoader(webpackLoaders.getBabelLoader(cx));

      //paths
      umdConf.addLoaderSearchPath(cx.__pluginDependencesDir);

      //local setting support
      getLocalWebpackConfig(umdConf);

      //umd settings
      umdConf.setContext(cx.__cwd);

      //umd build path
      umdConf.setBuildPath(cx.__builddir);

      //entires
      for (var key in wbp.entries) {
        umdConf.addBundleEntry(key, cx.getCwdPath(wbp.entries[key]));
      }

      //create webpack compiler
      cx.webpackCompiler = webpack(umdConf);

      //expose
      cx.umdConf = umdConf;
    })
}

/**
 * getLocalWebpackConfig support local modification.
 * @return promise
 */
function getLocalWebpackConfig(umdConf) {
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

/**
 * mountWebpackMiddles
 * @return {promise}
 */
function mountWebpackMiddles() {
  return Promise.try(function () {
    var webpackHotMiddleware = getWebpackHotMiddleware(cx.webpackCompiler);
    var webpackDevMiddleware = getWebpackDevMiddleware(cx.webpackCompiler, {
      noInfo: true,
      quiet: true,
      contentBase: cx.umdConf.output.path,
      publicPath: cx.umdConf.output.publicPath,
      watchOptions: {
        aggregateTimeout: 100
      },
      state: {
        chunks: false, // Makes the build much quieter
        colors: true
      }
    });
    expressServer.use(webpackDevMiddleware);
    expressServer.use(webpackHotMiddleware);
  });
}

