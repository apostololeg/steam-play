const HtmlWebpackPlugin = require('html-webpack-plugin');
const { assetsPath } = require('../paths');

module.exports = function(options) {
    const opts = Object.assign(
        {
            title: 'Chatra Test',
            filename: 'index.html',
            lang: 'ru',
            icon: false
        },
        options
    );

    return new HtmlWebpackPlugin({
        lang: opts.lang,
        title: opts.title,
        filename: opts.filename,
        template: `${assetsPath}/${opts.filename}`,
        chunksSortMode: 'dependency',
        hash: true,
        minify: {
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeStyleLinkTypeAttributes: true,
            keepClosingSlash: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true
        }
    });
};
