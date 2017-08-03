var webpack = require('webpack');
var express = require('express');
var expressServer = express();
var getWebpackDevMiddleware = require('webpack-dev-middleware');
var getWebpackHotMiddleware = require('webpack-hot-middleware');
var webpackLoaders = require('../etc/webpack.loaders.js');
var webpackFeatures = require('../etc/webpack.features.js');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var path = require('path');
var pfs = require('promisify-fs');
var fs = require('fs');
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
  // development/production
  var devMode = !(options['p'] || options['production']);
  if (!devMode) {
    process.env.NODE_ENV = 'production';
  }
  return getWebpackCompiler(devMode)
    .then(function() {
      //devMode / proMode output
      if (options['d'] || options['developemnt'] || options['p'] || options['production']) {
        return startWebpackCompiler();
      }

      // live developemnt
      return mountWebpackMiddles()
        .then(function() {
          return startDevServer();
        })
    })
    .then(function(finalstate) {
      cx.info('webpack compilation is done, successfully.');
    })
};
/**
 * @method startWebpackCompiler
 * @return {[type]}
 */
function startWebpackCompiler() {
  return Promise.fromCallback(function(cb) {
    cx.webpackCompiler.run(cb)
  })
}

/**
 * @method startDevServer
 * @return {[type]}
 */
function startDevServer() {
  if (fs.existsSync(cx.__ssldir)) {
    // start ssl dev server
    var sslOptions = {
      key: fs.readFileSync(cx.__ssldir + '/key'),
      cert: fs.readFileSync(cx.__ssldir + '/cert')
    };
    require('https').createServer(sslOptions, expressServer).listen(cx.umdConf.devServer.port, cx.umdConf.devServer.host, function() {
      cx.info('DevServer: ' + cx.umdConf.devServer.host + ':' + cx.umdConf.devServer.port + ' *ssl enabled*');
    });
    return
  }

  // start dev server
  return expressServer.listen(cx.umdConf.devServer.port, cx.umdConf.devServer.host, function() {
    cx.info('DevServer: ' + cx.umdConf.devServer.host + ':' + cx.umdConf.devServer.port + ' ');
  });
}

/**
 * getWebpackCompiler which support local modification
 * @method getWebpackCompiler
 * @return {[type]}
 */
function getWebpackCompiler(devMode) {
  return pfs
    .readJSON(cx.getCwdPath('./package.json'))
    .then(function(pkg) {
      var umdConf = require(cx.__plugin_dir + '/etc/webpack.config.umd.js');
      umdConf.pkg = pkg;
      umdConf.devMode = devMode;
      umdConf.webpackLoaders = webpackLoaders;
      umdConf.webpackFeatures = webpackFeatures(cx, umdConf);

      // Expose umdConfig
      cx.umdConf = umdConf;

      //project paths
      cx.__sourcedir = cx.getCwdPath(umdConf.pkg.wbp.source || './src');
      cx.__testdir = cx.getCwdPath(umdConf.pkg.wbp.test || './test');
      cx.__builddir = cx.getCwdPath(umdConf.pkg.wbp.build || './dist');
      cx.__ssldir = cx.getCwdPath(umdConf.pkg.wbp.ssl || './ssl');
      cx.__cwdDependencesDir = cx.__cwd + '/node_modules';
      cx.__homeDependenceDir = cx.__home + '/node_modules';
      cx.__pluginDependencesDir = cx.__plugin_dir + '/node_modules';

      //default umd settings
      if (devMode) {
        umdConf.addPlugin(new webpack.HotModuleReplacementPlugin());
      } else {
        umdConf.addPlugin(new webpack.optimize.DedupePlugin());
        umdConf.addPlugin(new webpack.optimize.OccurrenceOrderPlugin(true));
      }

      umdConf.addPlugin(new ExtractTextPlugin('[name]_[contenthash:7].css'));

      //Add Loaders Search Paths
      umdConf.addLoaderSearchPath(cx.__homeDependenceDir);
      umdConf.addLoaderSearchPath(cx.__pluginDependencesDir);
      umdConf.addLoaderSearchPath(cx.__cwdDependencesDir);

      // Add Module Loaders
      umdConf.addModuleLoader(webpackLoaders.getJSLoader(cx, devMode));
      umdConf.addModuleLoader(webpackLoaders.getCSSLoader(cx, devMode));
      umdConf.addModuleLoader(webpackLoaders.getSCSS_SRCLoader(cx, devMode));
      umdConf.addModuleLoader(webpackLoaders.getSCSSLoader(cx));
      umdConf.addModuleLoader(webpackLoaders.getLESS_SRCLoader(cx, devMode));
      umdConf.addModuleLoader(webpackLoaders.getLESSLoader(cx));
      umdConf.addModuleLoader(webpackLoaders.getImgLoader(cx));
      umdConf.addModuleLoader(webpackLoaders.getFontLoader(cx));

      //Add Module Search Paths
      umdConf.addModuleSearchPath(cx.__sourcedir);

      //ResolveEntryModules
      // umdConf.setContext(cx.__sourcedir);
      umdConf.setContext(cx.getCwdPath('./'));
      umdConf.setExportedName(umdConf.pkg.name);
      umdConf.setBuildPath(cx.__builddir);

      //UMD Project Entries
      for (var key in umdConf.pkg.wbp.entries) {
        umdConf.addBundleEntry(key, umdConf.pkg.wbp.entries[key]);
      }

      // Local Webpack Settings
      getLocalWebpackConfig(umdConf);

      // Create Webpack Compiler
      cx.webpackCompiler = webpack(umdConf);
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
  return Promise.try(function() {
    var webpackHotMiddleware = getWebpackHotMiddleware(cx.webpackCompiler);
    var webpackDevMiddleware = getWebpackDevMiddleware(cx.webpackCompiler, {
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

    if (cx.umdConf.historyfallback) {
      expressServer.use((req, res, next) => {
        if (!req.url.match(/(\.(html|css|js|png|jpeg|jpg|woff|svg)|hmr)/) && req.url !== '/') {
          req.originalUrl = req.path = req.url = '/';
        }
        next();
      })
    }

    expressServer.use(webpackDevMiddleware);
    expressServer.use(webpackHotMiddleware);
    expressServer.get('favicon.ico', function(req, res) {
      res.end();
    })
    expressServer.use(express.static(cx.__builddir));
  });
}