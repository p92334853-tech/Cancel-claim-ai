// Metro configuration tuned for this pnpm monorepo so the Expo app can consume
// the workspace package `@cancelclaim/core` directly from TypeScript source.
//
// Notes:
// - watchFolders includes the repo root so changes in packages/core are picked up.
// - nodeModulesPaths lists both the app and the root node_modules; combined with
//   disableHierarchicalLookup=false this lets Metro find hoisted + app-local deps.
// - unstable_enableSymlinks=true is required because pnpm links packages via symlinks.
// - unstable_enablePackageExports=true makes Metro honor core's `exports` map,
//   which points "." -> "./src/index.ts" (TypeScript source, no build step).
// - core authors imports with explicit `.js` specifiers (e.g. "./domain/index.js")
//   that physically resolve to `.ts` files. Metro resolves these because `ts`/`tsx`
//   are in sourceExts and it falls back to source extensions for relative requires.
//   See README.md for the known-setup note.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

config.resolver.unstable_enableSymlinks = true;
config.resolver.disableHierarchicalLookup = false;
config.resolver.unstable_enablePackageExports = true;

// Ensure TypeScript source extensions are resolvable (they are by default in
// Expo's config; we make it explicit so core's `.ts` entry resolves cleanly).
config.resolver.sourceExts = [...config.resolver.sourceExts];

module.exports = config;
