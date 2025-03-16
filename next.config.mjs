/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['maps.googleapis.com'],
  },
  experimental: {
    serverActions: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs', 'net', 'tls', etc. on the client side
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        aws4: false,
        'mongodb-client-encryption': false,
        'kerberos': false,
        'supports-color': false,
        'snappy': false,
        'bson-ext': false,
      };
    }
    return config;
  },
};

export default nextConfig;
