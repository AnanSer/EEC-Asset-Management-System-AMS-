/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/users',
        destination: '/employees',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
