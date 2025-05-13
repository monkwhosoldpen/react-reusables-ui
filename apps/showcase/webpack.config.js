// webpack.config.js
const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const { InjectManifest } = require('workbox-webpack-plugin');
const path = require('path');

module.exports = async function (env, argv) {
    const config = await createExpoWebpackConfigAsync(env, argv);

    // Remove default service worker plugin
    config.plugins = config.plugins.filter(
        (plugin) => plugin.constructor.name !== 'GenerateSW'
    );

    // Add your push-only service worker
    config.plugins.push(
        new InjectManifest({
            swSrc: './service-worker.js',
            swDest: 'service-worker.js',
            maximumFileSizeToCacheInBytes: 50 * 1024 * 1024, // 50MB
        })
    );

    // Configure dev server
    if (config.devServer) {
        // Ensure static middleware is configured correctly
        config.devServer.static = {
            directory: path.join(__dirname, 'web-build'),
            publicPath: '/',
            serveIndex: true,
        };

        // Add headers middleware
        config.devServer.headers = {
            'Service-Worker-Allowed': '/',
            'Access-Control-Allow-Origin': '*',
        };

        // Add mime type configuration
        config.devServer.mimeTypes = {
            typeMap: { 'application/javascript': ['js'] },
            force: true
        };
    }

    return config;
};
