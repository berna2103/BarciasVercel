import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true,
  },
  eslint:{
    ignoreDuringBuilds: true
  },
  // Removed unsupported i18n configuration for App Router
}

export default nextConfig