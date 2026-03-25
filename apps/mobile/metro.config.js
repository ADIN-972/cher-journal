const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const mobileNodeModules = path.resolve(projectRoot, 'node_modules');

// SDK 52+ auto-configures Metro for monorepos, so we only need
// the custom resolveRequest to force react/react-native to the
// mobile app's copies (avoids dual React copies in monorepo).
const config = getDefaultConfig(projectRoot);

// Support .wasm files (needed by expo-sqlite web)
config.resolver.assetExts = [...(config.resolver.assetExts || []), 'wasm'];

const forcedPrefixes = ['react', 'react-dom', 'react-native', '@react-native'];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const shouldForce = forcedPrefixes.some(prefix =>
    moduleName === prefix ||
    moduleName.startsWith(prefix + '/') ||
    moduleName.startsWith(prefix + '-')
  );

  if (shouldForce) {
    try {
      const resolved = require.resolve(moduleName, { paths: [mobileNodeModules] });
      return { type: 'sourceFile', filePath: resolved };
    } catch (e) {
      // Fall through to default resolution
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
