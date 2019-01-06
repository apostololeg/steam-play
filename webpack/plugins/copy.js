const CopyWebpackPlugin = require('copy-webpack-plugin');
const { assetsPath, buildPath } = require('../paths');

module.exports = function() {
    return new CopyWebpackPlugin([{
        from: assetsPath,
        to: buildPath
    }]);
};
