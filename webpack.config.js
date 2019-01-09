const merge = require('webpack-merge');
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin');
const DirectoryNamedWebpackPlugin = require('directory-named-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');

// Paths
const {
    sourcePath,
    modulesPath,
    assetsPath,
    buildPath } = require('./webpack/paths');

// Modules
const jsx = require('./webpack/modules/jsx');
const css = require('./webpack/modules/css');
const stylus = require('./webpack/modules/stylus');
const stylusWithModules = require('./webpack/modules/stylusWithModules');
const svg = require('./webpack/modules/svg');
const fonts = require('./webpack/modules/fonts');

// Plugins
const clear = require('./webpack/plugins/clear');
const extractStyles = require('./webpack/plugins/extractStyles');
const favicon = require('./webpack/plugins/favicon');
const html = require('./webpack/plugins/html');
const packageJson = require('./webpack/plugins/packageJson');
const sourceMaps = require('./webpack/plugins/sourceMaps');
const optimizeCSS = require('./webpack/plugins/optimizeCSS');
const copy = require('./webpack/plugins/copy');

// Server
const devserver = require('./webpack/devserver');

// Common config
const config = {
    devtool: 'source-map',
    entry: {
        app: `${sourcePath}/index.js`
    },
    output: {
        path: buildPath,
        filename: 'js/[name].js'
    },
    optimization: {
        concatenateModules: true,
        flagIncludedChunks: true,
        mangleWasmImports: true,
        mergeDuplicateChunks: true,
        moduleIds: 'hashed',
        noEmitOnErrors: true,
        occurrenceOrder: true,
        removeAvailableModules: true,
        removeEmptyChunks: true,
        runtimeChunk: 'single',
        sideEffects: true,
        splitChunks: {
            cacheGroups: {
                vendors: {
                    chunks: 'initial',
                    name: 'vendors',
                    test: /[\\/]node_modules[\\/]/,
                    enforce: true,
                    priority: 1
                }
            },
            maxAsyncRequests: 3
        },
        usedExports: true
    },
    module: {
        rules: [
            jsx(),
            css(),
            stylus({ sourceMap: false }),
            stylusWithModules({ sourceMap: false }),
            fonts(),
            svg()
        ]
    },
    resolve: {
        modules: [sourcePath, modulesPath, 'node_modules'],
        extensions: ['.js', '.jsx', '.json', '.styl'],
        plugins: [
            new DirectoryNamedWebpackPlugin(true)
        ]
    },
    plugins: [
        clear('build'),
        extractStyles(),
        favicon(),
        html({ icon: true }),
        new CopyWebpackPlugin([
            {
                from: assetsPath,
                to: buildPath
            }
        ])
    ]
};

module.exports = config;

// eslint-disable-next-line func-names
module.exports = function(env, argv) {
    const { mode } = argv;

    config.mode = mode;

    if (mode === 'production') {
        config.devtool = false;

        return merge([
            config,
            {
                plugins: [
                    packageJson('version', 'name'),
                    sourceMaps(),
                    optimizeCSS()
                ]
            }
        ]);
    }

    return merge([
        config,
        devserver({ port: 3003 }),
        {
            plugins: [
                new ErrorOverlayPlugin(),
                new WriteFilePlugin()
            ]
        }
    ]);
};
