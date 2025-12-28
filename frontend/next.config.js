/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    outputFileTracingIncludes: {
      '/': ['./lib/**/*'],
    },
  },
}

module.exports = nextConfig

