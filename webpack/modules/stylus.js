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
        test: /\.styl$/,
        exclude:[/node_modules/, /\.module\.styl$/],
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
                {
                    loader: 'css-loader',
                    options: opts
                },
                {
                    loader: 'postcss-loader',
                    options: {
                        sourceMap: opts.sourceMap,
                        config: {
                            path: `${rootPath}/postcss.config.js`
                        }
                    }
                },
                {
                    loader: 'stylus-loader',
                    options: {
                        sourceMap: opts.sourceMap
                    }
                }
            ],
            // for images and fonts
            publicPath: '../'
        })
    };
};
