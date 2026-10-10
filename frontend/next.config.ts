import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permitir acceso al dev server desde 127.0.0.1 (previews/tuneles) ademas de localhost
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  // Proxy: el frontend llama a /api/* y Next lo redirige al backend (evita CORS).
  // En produccion BACKEND_URL apunta a Railway; en dev cae a localhost:8080.
  async rewrites() {
    const backend = process.env.BACKEND_URL ?? "http://localhost:8080";
    return [
      {
        source: "/api/:path*",
        destination: `${backend}/api/:path*`,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
