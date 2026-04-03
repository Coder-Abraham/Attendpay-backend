const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Package exports resolution disabled — lucide-react-native uses file-based resolution
// config.resolver.unstable_enablePackageExports = true;

// Add asset extensions
config.resolver.assetExts.push('png', 'jpg', 'jpeg', 'gif', 'webp');

// Remove svg from assetExts so it's handled as source
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');

// Ensure proper source extensions
config.resolver.sourceExts = ['tsx', 'ts', 'jsx', 'js', 'json', 'svg'];

module.exports = withNativeWind(config, { input: './global.css' });
