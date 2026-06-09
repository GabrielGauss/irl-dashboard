/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark luxury base — layered near-black surfaces.
        void: '#0a0a0f',
        surface: {
          DEFAULT: '#101018',
          raised: '#15151f',
          hover: '#1b1b27',
        },
        line: {
          DEFAULT: '#1f1f2b',
          bright: '#2a2a3a',
        },
        ink: {
          DEFAULT: '#f2f2f7',
          muted: '#8b8b9a',
          dim: '#5a5a68',
          faint: '#3a3a47',
        },
        // Brand indigo accent.
        accent: {
          DEFAULT: '#6366f1',
          bright: '#818cf8',
          dim: '#4f46e5',
          glow: 'rgba(99,102,241,0.18)',
        },
        // Semantic compliance states.
        ok: '#34d399',
        warn: '#fbbf24',
        danger: '#f87171',
        info: '#60a5fa',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.02) inset, 0 8px 24px -12px rgba(0,0,0,0.7)',
        glow: '0 0 0 1px rgba(99,102,241,0.4), 0 0 24px -4px rgba(99,102,241,0.35)',
        inset: 'inset 0 1px 0 0 rgba(255,255,255,0.03)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        shimmer: 'shimmer 1.8s linear infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
