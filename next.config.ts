import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Serve .bin frame sprite files with correct MIME type and caching
        source: "/frames/:folder/:file*.bin",
        headers: [
          { key: "Content-Type", value: "application/octet-stream" },
          // Cache for 1 year — content-addressed by folder name
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
