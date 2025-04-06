const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add video file extensions to asset extensions
config.resolver.assetExts.push('mp4');

module.exports = withNativeWind(config, { input: './global.css' });
