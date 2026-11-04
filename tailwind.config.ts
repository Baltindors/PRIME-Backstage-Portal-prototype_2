import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'on-surface': 'var(--color-on-surface)',
        muted: 'var(--color-muted)',
        subtle: 'var(--color-subtle)',
        outline: 'var(--color-outline)',
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        'primary-pressed': 'var(--color-primary-pressed)',
        selected: 'var(--color-selected)',
        'icon-container': 'var(--color-icon-container)',
        'on-selected': 'var(--color-on-selected)',
        border: 'var(--color-border)',
        divider: 'var(--color-divider)',
        menu: 'var(--color-menu)',
        'hover-fill': 'var(--color-hover-fill)',
        error: 'var(--color-error)',
        live: 'var(--color-live)',
        'on-live': 'var(--color-on-live)',
        correct: 'var(--color-correct)',
        'on-correct': 'var(--color-on-correct)',
      },
      fontFamily: {
        sans: [
          'Google Sans',
          'Google Sans Text',
          'Product Sans',
          'system-ui',
          'sans-serif',
        ],
      },
      borderRadius: {
        field: 'var(--radius-field)',
        card: 'var(--radius-card)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        menu: 'var(--shadow-menu)',
      },
    },
  },
  plugins: [],
} satisfies Config
