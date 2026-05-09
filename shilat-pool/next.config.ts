import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  basePath: "/maori_stock_bot",
  turbopack: {
    root: path.resolve(__dirname),
  },
} as NextConfig;

export default nextConfig;
