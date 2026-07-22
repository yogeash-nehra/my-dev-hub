import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pages/route handlers read project files via fs + process.cwd() (see
  // src/lib/resources.ts and src/lib/digests.ts), which makes Next's output
  // file tracer conservatively pull large non-runtime directories into every
  // serverless function bundle — chiefly the webpack build cache and .git.
  // That pushed the resources function past Vercel's 250 MB limit. None of
  // these are needed at runtime, so exclude them from all function bundles.
  outputFileTracingExcludes: {
    '*': [
      '.next/cache/**',
      '.git/**',
    ],
  },
}

export default nextConfig
