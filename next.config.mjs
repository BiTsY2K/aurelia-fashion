
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Firebase Storage – product/media assets
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      // Placeholder source used during Phase 1 before you upload real media
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  // Strip console logs in production for a smaller, faster bundle
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
};

export default nextConfig;
