var webpack = require('webpack');
var webpackDevServer = require('webpack-dev-server');

var config = require("./webpack.config.js");
var compiler = webpack(config);
var server = new webpackDevServer(compiler, {
  hot: true,
  inline: true,
});
server.listen(8080);
