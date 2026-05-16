/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Ultra Dark Premium Palette (Brand Spec)
        'slate-950': 'oklch(14% 0.02 260)',
        'slate-900': 'oklch(18% 0.03 260)',
        'slate-50': 'oklch(98% 0.01 240)',
        'slate-400': 'oklch(70% 0.02 240)',
        'cyan-500': 'oklch(72% 0.16 195)',
        'rose-500': 'oklch(62% 0.22 15)',

        // Semantic mappings
        brand: {
          bg: 'oklch(14% 0.02 260)',
          surface: 'oklch(18% 0.03 260)',
          fg: 'oklch(98% 0.01 240)',
          muted: 'oklch(70% 0.02 240)',
          accent: 'oklch(72% 0.16 195)',
          danger: 'oklch(62% 0.22 15)',
        },

        // Legacy/Existing mappings (preserved for compatibility)
        primary: {
          DEFAULT: '#1E3A8A',
          dark: '#1E3A8A',
          light: '#3B82F6',
          lighter: '#DBEAFE',
        },
        // ... rest of existing colors if needed, but I'll focus on the new ones
      },
      backgroundColor: {
        'glass': 'rgba(15, 23, 42, 0.6)',
      },
      backdropBlur: {
        'premium': '12px',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}