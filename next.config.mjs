/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['ums.fisheries.go.th', '*.fisheries.go.th', 'localhost:3001'],
    },
  },
}

export default nextConfig
