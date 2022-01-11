module.exports = {
    entry: './src/main/js/App.tsx',
    cache: true,
    output: {
        path: __dirname + "/src/main/resources/static/built",
        filename: './bundle.js',
        publicPath: '/built/',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    '@jsdevtools/coverage-istanbul-loader',
                    'ts-loader'
                ],
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
};