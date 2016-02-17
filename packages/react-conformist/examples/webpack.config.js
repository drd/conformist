var webpack = require('webpack');

module.exports = {
    entry: {
        app: [
            './app.js',
            'webpack-dev-server/client?http://localhost:8080',
            'webpack/hot/dev-server'
        ]
    },
    output: {
        filename: 'app.js',
        path: __dirname + '/out',
        publicPath: '/out'
    },
    devtool: 'sourcemap',
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
    ],
    resolve: {
        // Allow to omit extensions when requiring these files
        extensions: ['', '.js', '.jsx']
    },
    resolveLoader: {
        // This is a bit nutty, but we set resolveLoader.root to the parent of
        // the entire jsxlate-loader directory, so it resolves
        // jsxlate-loader/index.js as the loader, allowing us to depend on the
        // module itself instead of npm inception
        fallback: __dirname + '/../../..'
    },
    module: {
        loaders: [
            { test: /\.jsx?$/, exclude: /node_modules/, loaders: ['babel'] },
        ]
    }
}
