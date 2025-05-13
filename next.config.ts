
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // Force consistent build tool usage (both dev and build should use the same)
  // Note: The main issue is the mixing of build tools between development and production
  experimental: {
    // We need to use the same toolchain in dev and production
    // No specific turbo config here as we'll handle this by updating script commands
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['picsum.photos'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'iutxzpzbznbgpkdwbzds.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
