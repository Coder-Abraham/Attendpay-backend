const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Disable package exports resolution to suppress warnings from packages
// with invalid exports fields (e.g. use-latest-callback, lucide-react-native)
config.resolver.unstable_enablePackageExports = false;

// Add asset extensions
config.resolver.assetExts.push('png', 'jpg', 'jpeg', 'gif', 'webp');

// Remove svg from assetExts so it's handled as source
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');

// Ensure proper source extensions
config.resolver.sourceExts = ['tsx', 'ts', 'jsx', 'js', 'json', 'svg'];

module.exports = withNativeWind(config, { input: './global.css' });
