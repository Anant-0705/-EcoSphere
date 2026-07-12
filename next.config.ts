import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfmake / pdf-parse use Node APIs
  serverExternalPackages: ["pdfmake", "pdf-parse", "bcryptjs"],
};

export default nextConfig;
