const webpack = require('webpack');
const pkgJSON = require('../../package.json');

module.exports = function(...fieldNames) {
    let fields = {};

    fieldNames.forEach(fieldName => {
        fields[fieldName] = JSON.stringify(pkgJSON[fieldName]);
    });

    return new webpack.DefinePlugin({
        'process.env': { ...fields }
    });
};
