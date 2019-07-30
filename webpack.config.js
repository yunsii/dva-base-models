"use strict";

const webpack = require('webpack');

const modName = "dva-base-models";

module.exports = {
    entry: "./src/",
    output: {
        filename: `./dist/${modName}.js`,
        library: modName,
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    module: {
        loaders: [
            { test: /\.ts?$/, loader: "awesome-typescript-loader" }
        ]
    }
};
