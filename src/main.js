/*eslint-disable*/
var webpack = require('webpack');
var expressServer = require('express')();
var getWebpackDevMiddleware = require('webpack-dev-middleware');
var getWebpackHotMiddleware = require('webpack-hot-middleware');
var CleanWebpackPlugin = require('clean-webpack-plugin');
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
 * @param {string}  __plugin_dir  plugin's absolute path
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
      if (options['o'] || options['output']) {
        return startWebpackCompiler();
      } else {
        return mountWebpackMiddles()
          .then(function () {
            return startDevServer();
          })
      }
    })
    .then(function (finalstate) {
      cx.info('webpack compilation is done, successfully.');
    })
};
/**
 * @method startWebpackCompiler
 * @return {[type]}
 */
function startWebpackCompiler() {
  return Promise.fromCallback(function (cb) {
    cx.webpackCompiler.run(cb)
  })
}

/**
 * @method startDevServer
 * @return {[type]}
 */
function startDevServer() {
  //start dev server
  return expressServer.listen(cx.umdConf.devServer.port, cx.umdConf.devServer.host, function () {
    cx.info('DevServer: ' + cx.umdConf.devServer.host + ':' + cx.umdConf.devServer.port + ' ');
  });
}

/**
 * getWebpackCompiler which support local modification
 * @method getWebpackCompiler
 * @return {[type]}
 */
function getWebpackCompiler() {
  return fs
    .readJSON(cx.getCwdPath('./package.json'))
    .then(function (pkg) {
      var umdConf = require(cx.__plugin_dir + '/etc/webpack.config.umd.js');
      umdConf.pkg = pkg;
      umdConf.webpackLoaders = webpackLoaders;

      //project paths
      cx.__sourcedir = cx.getCwdPath(umdConf.pkg.wbp.source || './src');
      cx.__builddir = cx.getCwdPath(umdConf.pkg.wbp.build || './dist');
      cx.__cwdDependencesDir = cx.__cwd + '/node_modules';
      cx.__homeDependenceDir = cx.__home + '/node_modules';
      cx.__pluginDependencesDir = cx.__plugin_dir + '/node_modules';

      //default umd settings
      umdConf.addPlugin(new webpack.HotModuleReplacementPlugin());
      umdConf.addPlugin(new webpack.optimize.OccurrenceOrderPlugin());
      umdConf.addPlugin(new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor']
      }));
      umdConf.addPlugin(new CleanWebpackPlugin([cx.__builddir], {
        root: cx.__cwd
      }))
      umdConf.setExportedName(umdConf.pkg.name);
      umdConf.addPlugin(new HTMLWebpackPlugin({
        filename: 'index.html',
        template: cx.__plugin_dir + '/etc/umd.template.html'
      }));

      umdConf.addModuleLoader(webpackLoaders.getJSLoader(cx));
      umdConf.addModuleLoader(webpackLoaders.getCSSLoader(cx));
      umdConf.addModuleLoader(webpackLoaders.getImgLoader(cx));
      umdConf.addModuleLoader(webpackLoaders.getFontLoader(cx));

      umdConf.addLoaderSearchPath(cx.__homeDependenceDir);
      umdConf.addLoaderSearchPath(cx.__pluginDependencesDir);
      umdConf.addLoaderSearchPath(cx.__cwdDependencesDir);

      umdConf.addModuleSearchPath(cx.__sourcedir);

      //umd settings used to resolve entry bunble.
      umdConf.setContext(cx.__sourcedir);

      //umd build path
      umdConf.setBuildPath(cx.__builddir);

      //addEntires
      for (var key in umdConf.pkg.wbp.entries) {
        umdConf.addBundleEntry(key, umdConf.pkg.wbp.entries[key]);
      }

      //local setting support
      getLocalWebpackConfig(umdConf);

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
    localWebpackConf = require(cx.__cwd + '/webpack.config.umd.js');
  } catch (e) {}
  if (localWebpackConf && localWebpackConf instanceof Function) {
    try {
      localWebpackConf(umdConf, cx);
    } catch (e) {
      cx.warn('Load local webpack config. error occurs.', e);
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
      // noInfo: true,
      // quiet: true,
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
    expressServer.get('favicon.ico', function (req, res) {
      res.end();
    })
  });
}

