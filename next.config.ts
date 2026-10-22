import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Some home networks (DNS64) resolve Supabase to 64:ff9b:: addresses, which the
    // optimizer treats as private. Only relax that locally; production keeps the check.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
