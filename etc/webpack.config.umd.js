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
    //websocket2DevServer(devServerClient) & webpackHotClient(webpack hot handler)
    var websocket2DevServer = require.resolve('webpack-dev-server/client') + '?http://' +
      this.devServer.host + ':' +
      this.devServer.port + '/';

    var webpackHotClient = require.resolve('webpack/hot/only-dev-server');

    var entryType = bundleEntry.constructor.name.toLowerCase();
    switch (entryType) {
    case 'string':
      bundleEntry = [websocket2DevServer, webpackHotClient, bundleEntry];
      break;
    case 'array':
      bundleEntry.unshift(websocket2DevServer, webpackHotClient);
      break;
    default:
      cx.warning('The type of bundleEntry is not supported yet.');
    }

    this.entry[bundleName] = bundleEntry;
  },
  output: {
    filename: '[name].js',
  },
  /**
   * setBuildPath
   * @param {string} buildPath
   */
  setBuildPath: function setBuildPath(buildPath) {
    this.output.path = buildPath;
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
    port: 8080,
    contentBase: '/',
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
};

