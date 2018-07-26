/** WEBPACK-CONFIG-UMD */
const externalNodeModules = require('webpack-node-externals');
const webpack = require('webpack');
const path = require('path');

const webpackOptions = {
  context: process.cwd(),

  entry: {},

  output: {
    path: path.resolve(process.cwd(), 'dist'),
    filename: '[name].js',
    publicPath: '',
    libraryTarget: 'umd',
    library: ''
  },

  module: {
    rules: [],
    // noParse: []
  },

  resolve: {
    extensions: ['.js', '.jsx', '.vue', '.css', '.scss', '.less'],
    modules: [],
    alias: {}
  },

  plugins: [],

  resolveLoader: {
    modules: []
  },

  target: 'web',

  externals: [],

  devServer: {
    host: '0.0.0.0',
    port: 8080
  }
};

module.exports = {
  webpackOptions,

  /**
   * setContext
   * @param {string} contextPath *MUST be a absolute path*
   */
  setContext: function setContext(contextPath) {
    this.webpackOptions.context = contextPath;
  },

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
    this.webpackOptions.entry[bundleName] = bundleEntry;
  },

  /**
   * @method setUMDName
   * @param  {[type]}   libraryName [description]
   */
  setExportedName: function(libraryName) {
    this.webpackOptions.output.library = libraryName;
  },

  setChuckFileName: function(chunkname) {
    this.webpackOptions.output.filename = chunkname;
  },

  /**
   * setBuildPath
   * @param {string} buildPath
   */
  setBuildPath: function setBuildPath(buildPath) {
    this.webpackOptions.output.path = buildPath;
  },
  /**
   * @method setPublicPath
   * @param  {string}      publicPath
   */
  setPublicPath: function setPublicPath(publicPath) {
    this.webpackOptions.output.publicPath = publicPath || '';
  },

  /**
   * addModuleLoader
   * @param {object} loader
   */
  addModuleLoader: function(loader) {
    this.webpackOptions.module.rules.push(loader);
  },

  /**
   * addModuleNoParse
   * @param {Regex} matchRegex , to match the resolved request.
   */
  addModuleNoParse: function(matchRegex) {
    if (!this.webpackOptions.module.noParse) this.webpackOptions.module.noParse = [];
    this.webpackOptions.module.noParse.push(matchRegex);
  },

  addParseInclude(abspath) {
    this.webpackOptions.module.rules[0].include.push(abspath);
  },

  /**
   * addModuleAlias
   * @param {string} source name
   * @param {string} alias name
   * @param {string} noparse
   * @param {string} isvendor
   */
  addModuleAlias: function(alias, source, noParse, isVendor) {
    this.webpackOptions.resolve.alias[alias] = source;

    if (noParse) {
      this.addModuleNoParse(source);
    }

    if (isVendor) {
      this.addVendor(source);
    }
  },

  addModuleExtention: function(ext) {
    var exts = this.webpackOptions.resolve.extensions
    var extIndex = exts.indexOf(ext)
    if (extIndex == -1) exts.unshift(ext)
  },

  /**
   * addModuleSearchPath
   * @param {string} *MUST* be absolute path
   */
  addModuleSearchPath: function(path) {
    this.webpackOptions.resolve.modules.push(path);
  },

  /**
   * addPlugin
   * @param {[object]} plugin
   */
  addPlugin: function(plugin) {
    this.webpackOptions.plugins.push(plugin);
  },

  /**
   * @method addVendor
   * @param vendor module name or absolute path
   */
  addVendor: function(vendor) {
    if (this.__vendorAlias) {
      if (vendor) {
        var vendorChunk = this.webpackOptions.entry[this.__vendorAlias];
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

  /**
   * addLoaderSearchPath
   * @param {string} *MUST* be absolute path
   */
  addLoaderSearchPath: function(path) {
    this.webpackOptions.resolveLoader.modules.push(path);
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

  /**
   * @method addExternal
   * @param  external // string,object,function,RegExp,array
   * http://webpack.github.io/docs/configuration.html#externals
   */
  addExternal: function(external) {
    this.webpackOptions.externals.push(external);
  },

  addExternalRequire: function(moduleName) {
    this.webpackOptions.externals.push({
      [moduleName]: 'commonjs ' + moduleName
    })
  },

  addRequireIgnore: function(requestRegExp, contextRegExp) {
    this.webpackOptions.addPlugin(new webpack.IgnorePlugin(requestRegExp, contextRegExp));
  },

  addExternalNodeModules: function(options) {
    this.webpackOptions.externals.push(externalNodeModules(Object.assign({
      whitelist: [],
      importType: 'commonjs',
      modulesDir: 'node_modules',
      modulesFromFile: false
    }, options)))
  },

  addExternalGlobal: function(objName) {
    this.webpackOptions.externals.push({
      [objName]: true
    })
  },

  /**
   * setDevServer local modification support
   * @type {string} host
   * @type {number} port
   */
  setDevServer: function(host, port, contentBase) {
    this.webpackOptions.devServer.host = host || 'localhost';
    this.webpackOptions.devServer.port = port || 8080;
    this.webpackOptions.devServer.contentBase = contentBase || this.webpackOptions.output.path;
  },

  postcss: function() {
    return [
      require('precss'),
      require('autoprefixer'),
    ]
  }
};
