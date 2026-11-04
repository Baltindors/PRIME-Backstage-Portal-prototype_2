export default defineNuxtConfig({
  ssr: false,
  nitro: {
    preset: 'github-pages',
  },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  app: {
    baseURL: '/PRIME-Backstage-Portal-prototype_2/',
    head: {
      title: 'PRIME Backstage Portal',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&display=swap',
        },
      ],
    },
  },
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.ts',
  },
  typescript: {
    strict: true,
  },
  compatibilityDate: '2025-07-15',
})
