module.exports = function() {
    return {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        exclude: /node_modules/
    };
};
