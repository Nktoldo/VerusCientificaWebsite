import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['https://www.veruscientifica.com.br'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'www.loccus.com.br',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'loccus.com.br',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  reactStrictMode: true,
  async headers() {
    return [
      // Headers específicos para sitemap.xml
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
      // Headers para robots.txt
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
      // Headers gerais para todas as outras rotas
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Permissions-Policy header (removendo browsing-topics que não é suportado)
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // CSP atualizada com Google Maps e Firebase Installations
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://veruswebsitedh-default-rtdb.firebaseio.com https://veruswebsitedh.firebaseio.com https://www.gstatic.com https://apis.google.com https://maps.googleapis.com https://s-usc1f-nss-2535.firebaseio.com https://s-usc1f-nss-2536.firebaseio.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com https://www.gstatic.com; img-src 'self' data: https: blob: https://firebasestorage.googleapis.com https://storage.googleapis.com https://veruswebsitedh.firebasestorage.app https://maps.googleapis.com https://maps.gstatic.com; connect-src 'self' https://www.google-analytics.com https://veruswebsitedh.firebaseio.com https://veruswebsitedh-default-rtdb.firebaseio.com https://veruswebsitedh.firebasestorage.app https://firebasestorage.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://firebase.googleapis.com https://generativelanguage.googleapis.com https://firebaseinstallations.googleapis.com https://s-usc1f-nss-2535.firebaseio.com https://s-usc1f-nss-2536.firebaseio.com ws://localhost:3000 ws://192.168.0.104:3000 wss://s-usc1f-nss-2535.firebaseio.com wss://s-usc1f-nss-2536.firebaseio.com wss://veruswebsitedh-default-rtdb.firebaseio.com wss://veruswebsitedh.firebaseio.com http://localhost:3000 http://192.168.0.104:3000; frame-src 'self' https://s-usc1f-nss-2535.firebaseio.com https://s-usc1f-nss-2536.firebaseio.com https://veruswebsitedh-default-rtdb.firebaseio.com https://veruswebsitedh.firebaseio.com https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://youtube-nocookie.com https://www.google.com; frame-ancestors 'self'; object-src 'none'; base-uri 'self';",
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;