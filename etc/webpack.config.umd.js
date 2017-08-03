/** WEBPACK-CONFIG-UMD */
const externalNodeModules = require('webpack-node-externals');
const webpack = require('webpack');
const path = require('path');

/*eslint-disable*/
module.exports = {
  context: process.cwd(),

  /**
   * setContext
   * @param {string} contextPath *MUST be a absolute path*
   */
  setContext: function setContext(contextPath) {
    this.context = contextPath;
  },

  entry: {},

  /**
   * addBundleEntry
   * @param {string} bundleName
   * @param {string/array} bundleEntry
   */
  addBundleEntry: function addBundleEntry(bundleName, bundleEntry) {

    var entryType = bundleEntry.constructor.name.toLowerCase();
    switch (entryType) {
      case 'string':
        bundleEntry = [bundleEntry];
        break;
      case 'array':
        break;
      default:
        cx.warning('The type of bundleEntry is not supported yet.');
    }
    this.entry[bundleName] = bundleEntry;
  },

  output: {
    path: path.resolve(process.cwd(), 'dist'),
    filename: '[name].js',
    publicPath: '/',
    libraryTarget: 'umd',
    library: ''
  },

  /**
   * @method setUMDName
   * @param  {[type]}   libraryName [description]
   */
  setExportedName: function(libraryName) {
    this.output.library = libraryName;
  },
  /**
   * setBuildPath
   * @param {string} buildPath
   */
  setBuildPath: function setBuildPath(buildPath) {
    this.output.path = buildPath;
  },
  /**
   * @method setPublicPath
   * @param  {string}      publicPath
   */
  setPublicPath: function setPublicPath(publicPath) {
    this.output.publicPath = publicPath;
  },

  module: {
    // loaders: [], old
    rules: [],
    noParse: []
  },

  /**
   * addModuleLoader
   * @param {object} loader
   */
  addModuleLoader: function(loader) {
    this.module.rules.push(loader);
  },

  /**
   * addModuleNoParse
   * @param {Regex} matchRegex , to match the resolved request.
   */
  addModuleNoParse: function(matchRegex) {
    this.module.noParse.push(matchRegex);
  },

  addParseInclude(abspath) {
    this.module.rules[0].include.push(abspath);
  },

  /**
   * addModuleAlias
   * @param {string} source name
   * @param {string} alias name
   * @param {string} noparse
   * @param {string} isvendor
   */
  addModuleAlias: function(alias, source, noParse, isVendor) {
    this.resolve.alias[alias] = source;

    if (noParse) {
      this.addModuleNoParse(source);
    }

    if (isVendor) {
      this.addVendor(source);
    }
  },

  resolve: {
    extensions: ['', '.js', '.jsx', '.css', '.scss', '.less'],
    modules: [],
    alias: {}
  },

  /**
   * addModuleSearchPath
   * @param {string} *MUST* be absolute path
   */
  addModuleSearchPath: function(path) {
    this.resolve.modules.push(path);
  },

  plugins: [],

  /**
   * addPlugin
   * @param {[object]} plugin
   */
  addPlugin: function(plugin) {
    this.plugins.push(plugin);
  },

  /**
   * @method addVendor
   * @param vendor module name or absolute path
   */
  addVendor: function(vendor) {
    if (this.__vendorAlias) {
      if (vendor) {
        var vendorChunk = this.entry[this.__vendorAlias];
        var valueType = vendor.constructor.name.toLowerCase();

        if (valueType == 'string') {
          vendorChunk.push(vendor);
        }
        if (valueType == 'array') {
          vendorChunk = vendorChunk.concat(vendor);
        }
      }
    } else {
      console.warn('Please enable vendors configuration.');
    }
  },

  resolveLoader: {
    modules: []
  },

  /**
   * addLoaderSearchPath
   * @param {string} *MUST* be absolute path
   */
  addLoaderSearchPath: function(path) {
    this.resolveLoader.modules.push(path);
  },
  /*
  "web" Compile for usage in a browser-like environment (default)
  "webworker" Compile as WebWorker
  "node" Compile for usage in a node.js-like environment (use require to load chunks)
  "async-node" Compile for usage in a node.js-like environment (use fs and vm to load chunks async)
  "node-webkit" Compile for usage in webkit, uses jsonp chunk loading but also supports build in node.js modules plus require(“nw.gui”) (experimental)
  "electron" Compile for usage in Electron – supports require-ing Electron-specific modules.
  "electron-renderer" Compile for electron renderer process, provide a target using JsonpTemplatePlugin, FunctionModulePlugin for browser environment and NodeTargetPlugin and ExternalsPlugin for commonjs and electron bulit-in modules. Note: need webpack >= 1.12.15.
   */

  target: 'web',

  externals: [],
  /**
   * @method addExternal
   * @param  external // string,object,function,RegExp,array
   * http://webpack.github.io/docs/configuration.html#externals
   */
  addExternal: function(external) {
    this.externals.push(external);
  },

  addExternalRequire: function(moduleName) {
    this.externals.push({
      [moduleName]: 'commonjs ' + moduleName
    })
  },

  addRequireIgnore: function(requestRegExp, contextRegExp) {
    this.addPlugin(new webpack.IgnorePlugin(requestRegExp, contextRegExp));
  },

  addExternalNodeModules: function(options) {
    this.externals.push(externalNodeModules(Object.assign({
      whitelist: [],
      importType: 'commonjs',
      modulesDir: 'node_modules',
      modulesFromFile: false
    }, options)))
  },

  addExternalGlobal: function(objName) {
    this.externals.push({
      [objName]: true
    })
  },

  devServer: {
    host: 'localhost',
    port: 8080
  },
  /**
   * setDevServer local modification support
   * @type {string} host
   * @type {number} port
   */
  setDevServer: function setDevServer(host, port) {
    this.devServer.host = host || 'localhost';
    this.devServer.port = port || 8080;
  },

  postcss: function() {
    return [
      require('precss'),
      require('autoprefixer'),
    ]
  }
};