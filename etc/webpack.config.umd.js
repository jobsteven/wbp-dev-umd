/** WEBPACK-CONFIG-UMD */
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

  /**
   * @method addVendor
   * @param vendor module name or absolute path
   */
  addVendor: function (vendor) {
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

  output: {
    filename: '[name].js',
    publicPath: '/',
    libraryTarget: 'umd',
    library: ''
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

  /**
   * @method setUMDName
   * @param  {[type]}   libraryName [description]
   */
  setExportedName: function (libraryName) {
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
    loaders: [],
    noParse: []
  },
  /**
   * addModuleLoader
   * @param {object} loader
   */
  addModuleLoader: function (loader) {
    this.module.loaders.push(loader);
  },
  /**
   * addModuleNoParse
   * @param {Regex} matchRegex , to match the resolved request.
   */
  addModuleNoParse: function (matchRegex) {
    this.module.noParse.push(matchRegex);
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.css', '.scss', '.less'],
    root: [],
    alias: {}
  },
  /**
   * addModuleSearchPath
   * @param {string} *MUST* be absolute path
   */
  addModuleSearchPath: function (path) {
    this.resolve.root.push(path);
  },
  /**
   * addModuleAlias
   * @param {string} source name
   * @param {string} alias name
   * @param {string} noparse
   * @param {string} isvendor
   */
  addModuleAlias: function (alias, source, noParse, isVendor) {
    this.resolve.alias[alias] = source;

    if (noParse) {
      this.addModuleNoParse(source);
    }

    if (isVendor) {
      this.addVendor(source);
    }
  },

  externals: [],
  /**
   * @method addExternal
   * @param  external // string,object,function,RegExp,array
   * http://webpack.github.io/docs/configuration.html#externals
   */
  addExternal: function (external) {
    this.externals.push(external);
  },
  addExternalRequire: function (moduleName) {
    this.externals.push({
      [moduleName]: 'commonjs ' + moduleName
    })
  },
  addExternalGlobal: function (objName) {
    this.externals.push({
      [objName]: true
    })
  },
  resolveLoader: {
    root: []
  },
  /**
   * addLoaderSearchPath
   * @param {string} *MUST* be absolute path
   */
  addLoaderSearchPath: function (path) {
    this.resolveLoader.root.push(path);
  },
  plugins: [],
  /**
   * addPlugin
   * @param {[object]} plugin
   */
  addPlugin: function (plugin) {
    this.plugins.push(plugin);
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

  postcss: function () {
    return [
      require('precss'),
      require('autoprefixer'),
    ]
  }
};
