module.exports = {
    entry: './src/main/js/App.tsx',
    mode: "development",
    devtool: "inline-source-map",
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
                    'babel-loader'
                ],
                exclude: /node_modules/
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