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
var asar = require('asar');
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
        return startWebpackCompiler().then(() => {
          if (cx.umdConf.webpackFeatures.enableASAR) {
            return Promise.fromCallback((cb) => {
              asar.createPackage(cx.__builddir, cx.__buildASARdir, () => {
                cb();
              })
            })
          }
        }).then(() => {
          console.log('*************SUCCESS****************');
        })
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
    require('https').createServer(sslOptions, expressServer).listen(cx.webpackOptions.devServer.port, cx.webpackOptions.devServer.host, function() {
      cx.info('DevServer: ' + cx.webpackOptions.devServer.host + ':' + cx.webpackOptions.devServer.port + ' *ssl enabled*');
    });
    return
  }

  // start dev server
  return expressServer.listen(cx.webpackOptions.devServer.port, cx.webpackOptions.devServer.host, function() {
    cx.info('DevServer: ' + cx.webpackOptions.devServer.host + ':' + cx.webpackOptions.devServer.port + ' ');
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
      cx.__buildASARdir = cx.__builddir + '/app.asar';
      cx.__ssldir = cx.getCwdPath(umdConf.pkg.wbp.ssl || './ssl');
      cx.__cwdDependencesDir = cx.__cwd + '/node_modules';
      cx.__homeDependenceDir = cx.__home + '/node_modules';
      cx.__pluginDependencesDir = cx.__plugin_dir + '/node_modules';

      umdConf.addPlugin(new webpack.DefinePlugin({ WBP_DEV: devMode }));

      if (devMode) {
        umdConf.addPlugin(new webpack.HotModuleReplacementPlugin());
      } else {
        // umdConf.addPlugin(new webpack.optimize.DedupePlugin());
        // umdConf.addPlugin(new webpack.HashedModuleIdsPlugin());
        // umdConf.addPlugin(new webpack.optimize.OccurrenceOrderPlugin(true));
        umdConf.addPlugin(new ExtractTextPlugin('[name]_[contenthash:7].css'));
        umdConf.webpackFeatures.enableUglifyJs();
      }

      //Add Loaders Search Paths
      umdConf.addLoaderSearchPath(cx.__pluginDependencesDir);
      umdConf.addLoaderSearchPath(cx.__homeDependenceDir);
      // umdConf.addLoaderSearchPath(cx.__cwdDependencesDir);

      // Add Module Loaders
      umdConf.addModuleLoader(webpackLoaders.getJSLoader(cx, devMode));
      umdConf.addModuleLoader(webpackLoaders.getCSSLoader(cx, devMode));
      umdConf.addModuleLoader(webpackLoaders.getLESS_SRCLoader(cx, devMode));
      umdConf.addModuleLoader(webpackLoaders.getFontLoader(cx, devMode));
      umdConf.addModuleLoader(webpackLoaders.getImgLoader(cx, devMode));

      // umdConf.addModuleLoader(webpackLoaders.getLESSLoader(cx));
      // umdConf.addModuleLoader(webpackLoaders.getSCSS_SRCLoader(cx, devMode));
      // umdConf.addModuleLoader(webpackLoaders.getSCSSLoader(cx));
      // umdConf.addModuleLoader(webpackLoaders.getImgLoader(cx));

      //Add Module Search Paths
      umdConf.addModuleSearchPath(cx.__sourcedir);
      umdConf.addModuleSearchPath('node_modules');
      umdConf.addModuleSearchPath(cx.__pluginDependencesDir);
      // umdConf.addModuleSearchPath(cx.__cwdDependencesDir);

      //ResolveEntryModules
      // umdConf.setContext(cx.__sourcedir);
      umdConf.setContext(cx.getCwdPath('./'));
      umdConf.setExportedName(umdConf.pkg.name);
      umdConf.setBuildPath(cx.__builddir);

      // Local Webpack Settings -*****************
      getLocalWebpackConfig(umdConf);

      //UMD Project Entries
      for (var key in umdConf.pkg.wbp.entries) {
        umdConf.addBundleEntry(key, umdConf.pkg.wbp.entries[key]);
        if (umdConf.webpackOptions.target === 'web') {
          umdConf.webpackFeatures.enableEntryHTML(key);
          if (devMode) {
            umdConf.webpackFeatures.enableEntryHot(key);
          }
        }
      }

      //default umd settings
      if (umdConf.webpackOptions.target === 'web') {
        umdConf.webpackFeatures.enableChuckHash();

        if (devMode) {
          umdConf.webpackFeatures.enableDevtool();
        }

        // last features
        if (umdConf.webpackFeatures.enableOffline) {
          umdConf.webpackFeatures.installOffline();
        }
      }

      // webpack options is done
      cx.webpackOptions = umdConf.webpackOptions;

      // Create Webpack Compiler
      cx.webpackCompiler = webpack(cx.webpackOptions);
      cx.webpackCompiler.apply(new webpack.ProgressPlugin());
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
  } catch (e) {
    console.log('ignore local webpack configuartion.');
  }
  if (localWebpackConf && localWebpackConf instanceof Function) {
    try {
      localWebpackConf(umdConf, cx);
    } catch (e) {
      cx.warn('Load local webpack config. error occurs.' + e);
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
      contentBase: cx.webpackOptions.output.path,
      publicPath: cx.webpackOptions.output.publicPath,
      noInfo: false,
      quiet: false,
      watchOptions: {
        aggregateTimeout: 100
      },
      state: {
        chunks: false, // Makes the build much quieter
        colors: true
      }
    });

    if (cx.umdConf.webpackFeatures.enableHistoryfallback) {
      expressServer.use((req, res, next) => {
        if (!req.url.match(/(\.(html|css|js|png|jpeg|jpg|woff|appcache|svg)|hmr)/) && req.url !== '/') {
          req.originalUrl = req.path = req.url = '/';
        }
        next();
      })
    }

    expressServer.use(webpackDevMiddleware);
    expressServer.use(webpackHotMiddleware);
    expressServer.get('favicon.ico', (req, res) => {
      res.end();
    })
    expressServer.use(express.static(cx.__builddir));
  });
}