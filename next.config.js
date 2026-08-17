/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === "production";
const basePath = isProd ? "/PortafolioIOS3" : "";

const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: basePath ? `${basePath}/` : "",
  trailingSlash: true,
  env: {
    // Disponible en cualquier archivo cliente/servidor para prefijar
    // rutas de assets escritas a mano (ej. wallpapers en lib/data.ts)
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

module.exports = nextConfig;