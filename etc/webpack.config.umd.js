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
  entry: {
    vendor: []
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
    this.entry[bundleName] = bundleEntry;
  },

  /**
   * @method addVendor
   * @param vendor module name or absolute path
   */
  addVendor: function (vendor) {
    if (vendor) {
      var valueType = vendor.constructor.name.toLowerCase();

      if (valueType == 'string') {
        this.entry.vendor.push(vendor);
      }
      if (valueType == 'array') {
        this.entry.vendor = this.entry.vendor.concat(vendor);
      }
    }
  },
  output: {
    filename: '[name].js',
    publicPath: '/',
    libraryTarget: 'umd',
    library: ''
  },
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
    extensions: ['', '.js', '.jsx'],
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
   */
  addModuleAlias: function (source, alias) {
    this.resolve.alias[source] = alias;
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

  /**
   * @method enableHotReplacement
   */
  enableHotReplacement: function (entryName) {
    var webpackHotClient = require.resolve('webpack-hot-middleware/client') + '?reload=true';
    var entryBundle = this.entry[entryName || 'main'];
    if (entryBundle)
      entryBundle.unshift(webpackHotClient);
  }
};

