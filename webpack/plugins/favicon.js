const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const { assetsPath } = require('../paths');

module.exports = function(options) {
    return new FaviconsWebpackPlugin(`${assetsPath}/favicon.svg`);
};
