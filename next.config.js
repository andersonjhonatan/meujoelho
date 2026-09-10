// next-pwa (o pacote original) está sem manutenção desde 2022 e arrastava um
// workbox antigo com vulnerabilidades conhecidas. Este é o fork mantido, que
// suporta Next 14/15.
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
  // Cacheia as telas conforme o usuário navega — importante para o app abrir na
  // academia sem sinal.
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  fallbacks: { document: "/offline" },
  workboxOptions: {
    skipWaiting: true,
    runtimeCaching: [
      {
        // Ilustrações próprias: são fixas, então cache agressivo.
        urlPattern: /\/exercises\/.*\.(png|jpg|jpeg|svg|webp)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "exercise-images",
          expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 90 },
        },
      },
      {
        // Imagens otimizadas pelo Next (inclui as fotos vindas da wger).
        urlPattern: /\/_next\/image\?url=.+$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "next-image",
          expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: "CacheFirst",
        options: { cacheName: "next-static", expiration: { maxEntries: 120 } },
      },
      {
        // Telas: rede primeiro (o plano muda conforme a fase), cache como rede
        // de segurança quando a conexão cai.
        urlPattern: ({ request }) => request.mode === "navigate",
        handler: "NetworkFirst",
        options: {
          cacheName: "pages",
          networkTimeoutSeconds: 4,
          expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 7 },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Sem isto o Next procura a raiz do workspace subindo diretórios e pode achar
  // um package-lock.json de outra pasta, empacotando arquivos errados no deploy.
  outputFileTracingRoot: __dirname,
  images: {
    // As fotos da wger vêm deste host; declarar aqui permite que o Next as
    // otimize (antes eram servidas com `unoptimized`, no tamanho original).
    remotePatterns: [{ protocol: "https", hostname: "wger.de", pathname: "/media/**" }],
    formats: ["image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
