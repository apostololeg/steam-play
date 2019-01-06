const ExtractTextPlugin = require('extract-text-webpack-plugin');
const { rootPath } = require('../paths');

module.exports = function(options) {
    const opts = Object.assign(
        {
            modules: true,
            localIdentName: '[local]__[name]___[hash:base64:5]',
            sourceMap: false
        },
        options
    );

    return {
        test: /\.module\.styl$/,
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
                        config: {
                            path: `${rootPath}/postcss.config.js`
                        },
                        options: {
                            sourceMap: opts.sourceMap
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
            publicPath: '../' // for images and fonts
        })
    };
};
