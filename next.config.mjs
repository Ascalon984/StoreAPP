/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
  // Enable compression
  compress: true,
  // Optimize package imports
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
