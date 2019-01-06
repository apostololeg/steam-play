const { publicPath } = require('./paths');

module.exports = function(options) {
    const opts = Object.assign(
        { port: 9000, host: 'localhost', open: false },
        options
    );

    return {
        devServer: {
            contentBase: publicPath,
            compress: true,
            historyApiFallback: true,
            open: opts.open,
            host: opts.host,
            port: opts.port,
            stats: 'errors-only'
        }
    };
};
