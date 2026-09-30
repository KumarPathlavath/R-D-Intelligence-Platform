/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        'sky-soft': 'var(--sky-soft)',
        'sky-deep': 'var(--sky-deep)',
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        lowtrust: 'var(--lowtrust)',
        patent: 'var(--patent)',
        policy: 'var(--policy)',
        startup: 'var(--startup)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      borderRadius: {
        '2xl': '1.25rem',
      },
      fontFamily: {
        sans: ['Manrope', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        'shimmer-slide': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'soft-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(14, 165, 233, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(14, 165, 233, 0)' },
        },
      },
      animation: {
        'shimmer': 'shimmer-slide 2s infinite linear',
        'soft-pulse': 'soft-pulse 2.5s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}
