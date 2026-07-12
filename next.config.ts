import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Node-only packages — do not bundle into serverless graph (avoids Vercel 500s)
  serverExternalPackages: [
    "pdfmake",
    "pdf-parse",
    "bcryptjs",
    "googleapis",
    "google-auth-library",
    "gaxios",
    "pdfkit",
  ],
};

export default nextConfig;
