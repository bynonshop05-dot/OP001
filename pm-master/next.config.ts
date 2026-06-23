import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/OP001",
  assetPrefix: "/OP001",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
