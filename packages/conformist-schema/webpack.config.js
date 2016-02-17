var path = require('path');
var webpack = require('webpack');

module.exports = {
    devtool: 'sourcemap',

    entry: './index.js',

    output: {
        filename: 'index.js',
        path: path.resolve('./build'),
        libraryTarget: 'commonjs'
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                loaders: ['babel?optional=runtime'],
                include: path.resolve('./src')
            }
        ]
    },

    stats: {
        colors: true
    }
}
