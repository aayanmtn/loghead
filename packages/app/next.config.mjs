/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  // This creates a minimal production build with only necessary files
  output: 'standalone',
  images: {
      unoptimized: true
  },
  async redirects() {
    return [
      {
        source: '/docs',
        destination: 'https://github.com/onvo-ai/loghead',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
