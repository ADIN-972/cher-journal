const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the monorepo root for shared packages
config.watchFolders = [monorepoRoot];

// Set module resolution order: mobile's node_modules first, then root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Forcefully redirect all React/React Native imports to the mobile app's copies.
// This is necessary because in a monorepo, dependencies hoisted to the root
// may resolve react@18 from ../../node_modules/react instead of the mobile
// app's react@19, causing "Invalid hook call" errors from two React copies.
const mobileNodeModules = path.resolve(projectRoot, 'node_modules');
const forcedModules = {
  'react': path.resolve(mobileNodeModules, 'react'),
  'react-native': path.resolve(mobileNodeModules, 'react-native'),
};

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Check exact match or subpath (e.g. react/jsx-runtime)
  for (const [pkg, pkgPath] of Object.entries(forcedModules)) {
    if (moduleName === pkg || moduleName.startsWith(pkg + '/')) {
      const subpath = moduleName === pkg ? '' : moduleName.slice(pkg.length);
      return {
        type: 'sourceFile',
        filePath: require.resolve(pkg + subpath, { paths: [mobileNodeModules] }),
      };
    }
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
