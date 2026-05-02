/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core
        ink: '#111111',
        body: '#374151',
        muted: '#6b7280',
        'muted-soft': '#898989',
        // Surface
        canvas: '#ffffff',
        'surface-soft': '#f8f9fa',
        'surface-card': '#f5f5f5',
        'surface-strong': '#e5e7eb',
        'surface-dark': '#101010',
        'surface-dark-elevated': '#1a1a1a',
        // Border
        hairline: '#e5e7eb',
        'hairline-soft': '#f3f4f6',
        // On-surface
        'on-primary': '#ffffff',
        'on-dark': '#ffffff',
        'on-dark-soft': '#a1a1aa',
        // Semantic
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        'brand-accent': '#3b82f6',
        // Badge
        'badge-emerald': '#34d399',
        'badge-orange': '#fb923c',
        'badge-pink': '#ec4899',
        'badge-violet': '#8b5cf6',
        // Status badge backgrounds
        'status-present-bg': '#d1fae5',
        'status-present-text': '#065f46',
        'status-absent-bg': '#fee2e2',
        'status-absent-text': '#991b1b',
        'status-leave-bg': '#ede9fe',
        'status-leave-text': '#5b21b6',
        'status-halfday-bg': '#fff7ed',
        'status-halfday-text': '#9a3412',
        'status-approved-bg': '#d1fae5',
        'status-approved-text': '#065f46',
        'status-pending-bg': '#fef3c7',
        'status-pending-text': '#92400e',
        'status-rejected-bg': '#fee2e2',
        'status-rejected-text': '#991b1b',
      },
      fontFamily: {
        display: ['"Cal Sans"', 'Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-xl': ['56px', { lineHeight: '1.08', letterSpacing: '0.01em', fontWeight: '250' }],
        'display-lg': ['42px', { lineHeight: '1.12', letterSpacing: '0.015em', fontWeight: '250' }],
        'display-md': ['32px', { lineHeight: '1.18', letterSpacing: '0.015em', fontWeight: '250' }],
        'display-sm': ['26px', { lineHeight: '1.22', letterSpacing: '0.02em', fontWeight: '250' }],
        'title-lg': ['22px', { lineHeight: '1.3', letterSpacing: '-0.005em', fontWeight: '600' }],
        'title-md': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'title-sm': ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-md': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['13px', { lineHeight: '1.4', fontWeight: '500' }],
        'btn': ['14px', { lineHeight: '1', fontWeight: '600' }],
        'nav': ['14px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        'pill': '9999px',
      },
      spacing: {
        'xxs': '4px',
        'xs': '8px',
        'sm-gap': '12px',
        'md-gap': '16px',
        'lg-gap': '24px',
        'xl-gap': '32px',
        'xxl': '48px',
        'section': '96px',
      },
      maxWidth: {
        'content': '1200px',
      },
      boxShadow: {
        'soft': '0 1px 2px rgba(0,0,0,0.05)',
        'elevated': '0 4px 12px rgba(0,0,0,0.08)',
        'card': '0 1px 3px rgba(0,0,0,0.06)',
      },
      animation: {
        'marquee': 'marquee 35s linear infinite',
        'marquee-reverse': 'marquee-reverse 35s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
