import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // إذا كنت تريد تجاهل الـ ESLint أثناء الـ Build في النسخ الجديدة
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // هذا سيسمح للـ Build بالمرور حتى لو وجد أخطاء TypeScript
    // (استخدمه فقط كحل مؤقت لتشغيل الموقع)
    ignoreBuildErrors: true, 
  },
};

export default nextConfig;
