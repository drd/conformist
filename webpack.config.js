var path = require('path');
var webpack = require('webpack');

module.exports = {
    devtool: 'sourcemap',

    entry: './src/conformist.js',

    output: {
        filename: 'index.js',
        path: path.resolve('./build'),
        libraryTarget: 'commonjs'
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                loaders: ['babel'],
                include: path.resolve('./src')
            }
        ]
    },

    stats: {
        colors: true
    }
}
