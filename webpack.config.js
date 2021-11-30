const CompressionPlugin = require("compression-webpack-plugin");
const zlib = require("zlib");

module.exports = {
    entry: './src/main/js/App.tsx',
    cache: true,
    output: {
        path: __dirname,
        filename: './src/main/resources/static/built/bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.yaml$/i,
                use: 'raw-loader',
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    experiments: {
        topLevelAwait: true
    },
    plugins: [
        new CompressionPlugin({
            filename: "[path][base].gz",
            algorithm: "gzip",
            test: /\.js$|\.css$|\.html$/,
            threshold: 10240,
            minRatio: 0.8,
        }),
        new CompressionPlugin({
            filename: "[path][base].br",
            algorithm: "brotliCompress",
            test: /\.(js|css|html|svg)$/,
            compressionOptions: {
                params: {
                    [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
                },
            },
            threshold: 10240,
            minRatio: 0.8,
        }),
    ],
};