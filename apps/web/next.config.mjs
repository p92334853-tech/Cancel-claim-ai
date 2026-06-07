/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Consume the shared TypeScript package directly (no build step in core).
  transpilePackages: ["@cancelclaim/core"],
  eslint: {
    // Lint is run separately; don't block production builds on it.
    ignoreDuringBuilds: true,
  },
  // Keep server-only heavy deps out of the client bundle.
  serverExternalPackages: ["@prisma/client", "pdf-lib", "@anthropic-ai/sdk", "stripe"],
  webpack: (config) => {
    // The shared core package uses ".js" specifiers that resolve to ".ts" sources.
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
      ...(config.resolve.extensionAlias ?? {}),
    };
    return config;
  },
};

export default nextConfig;
