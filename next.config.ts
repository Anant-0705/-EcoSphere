import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Node-only packages — keep out of client/edge bundles
  serverExternalPackages: [
    "pdfmake",
    "bcryptjs",
    "googleapis",
    "google-auth-library",
    "gaxios",
    "pdfkit",
    "unpdf",
  ],
};

export default nextConfig;
