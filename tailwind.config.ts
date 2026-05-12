import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D9488',
          light: '#F0FDFA',
          dark: '#0F766E',
        },
        accent: '#14B8A6',
      },
      maxWidth: {
        container: '1280px',
      },
      boxShadow: {
        // ── Soft Layer System (Lebih Berdimensi & Solid) ──
        'layer-xs':
          '0 1px 2px rgba(15, 23, 42, 0.05)', // Menaikkan sedikit opasitas agar tegas

        'layer-sm':
          '0 1px 2px rgba(15, 23, 42, 0.02), 0 4px 8px rgba(15, 23, 42, 0.04)',

        'layer-md':
          '0 1px 3px rgba(15, 23, 42, 0.03), 0 8px 16px rgba(15, 23, 42, 0.06)',

        'layer-lg':
          '0 2px 4px rgba(15, 23, 42, 0.03), 0 16px 24px rgba(15, 23, 42, 0.08)',

        'layer-xl':
          '0 4px 8px rgba(15, 23, 42, 0.04), 0 24px 48px rgba(15, 23, 42, 0.12)',

        // ── Premium Elevation (Efek 3D Nyata dengan Ring Pembatas) ──
        // Menambahkan 1px stroke tipis di bagian paling atas (lapisan pertama) agar objek terlihat "berdiri"
        'elevation-1':
          '0 0 0 1px rgba(15, 23, 42, 0.02), 0 2px 4px rgba(15, 23, 42, 0.04), 0 8px 16px rgba(15, 23, 42, 0.06)',

        'elevation-2':
          '0 0 0 1px rgba(15, 23, 42, 0.03), 0 4px 8px rgba(15, 23, 42, 0.06), 0 16px 32px rgba(15, 23, 42, 0.08)',

        'elevation-3':
          '0 0 0 1px rgba(15, 23, 42, 0.04), 0 12px 24px rgba(15, 23, 42, 0.08), 0 32px 64px rgba(15, 23, 42, 0.12)',
        // Interactive shadows
        'hover-lift': '0 12px 24px rgba(0, 0, 0, 0.15), 0 6px 12px rgba(0, 0, 0, 0.1)',
        'focus-ring': '0 0 0 3px rgba(13, 148, 136, 0.1)',
      },
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, rgba(13, 148, 136, 0.05) 0%, rgba(20, 184, 166, 0.02) 100%)',
        'gradient-overlay': 'linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.05) 100%)',
      },
      backdropFilter: {
        'glass-light': 'blur(10px) brightness(1.1)',
        'glass-dark': 'blur(8px) brightness(0.95)',
      },
      animation: {
        'slide-up': 'slideUp 300ms ease-out',
        'slide-down': 'slideDown 300ms ease-out',
        'slide-in-right': 'slideInRight 300ms ease-out',
        'fade-in': 'fadeIn 200ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
      },
      keyframes: {
        slideUp: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        slideDown: {
          from: { transform: 'translateY(-10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
