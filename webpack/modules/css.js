const ExtractTextPlugin = require('extract-text-webpack-plugin');

const { rootPath } = require('../paths');

module.exports = function(options) {
    const opts = Object.assign(
        {
            sourceMap: false
        },
        options
    );

    return {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
                {
                    loader: 'css-loader',
                    options: opts
                }
            ],
            // For images and fonts
            publicPath: '../'
        })
    };
};
