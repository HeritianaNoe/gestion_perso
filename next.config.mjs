/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Les Server Actions limitent le corps à 1 Mo par défaut : on autorise les photos (2 Mo)
    serverActions: { bodySizeLimit: "3mb" },
  },
};

export default nextConfig;
