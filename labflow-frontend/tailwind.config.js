/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy palette names still used by some components, mapped onto the LabFlow theme
        ink: { DEFAULT: '#0B1F44', surface: '#FFFFFF', border: '#E5EAF2', muted: '#94A3B8' },
        paper: { DEFAULT: '#F5F7FB', card: '#FFFFFF', sidebar: '#EEF2F8' },
        pine: { DEFAULT: '#2563EB', hover: '#1D4ED8', light: '#EAF1FF', dark: '#1E3A8A' },
        amber: { DEFAULT: '#D97706', light: '#FFF3E0', dark: '#B45309' },
        moss: { DEFAULT: '#15803D', light: '#E8F7EE', dark: '#166534' },
        brick: { DEFAULT: '#DC2626', light: '#FDECEC', dark: '#991B1B' },
        stone: { DEFAULT: '#64748B', border: '#E5EAF2', light: '#EEF2F8', subtle: '#94A3B8', muted: '#94A3B8' },
        lf: {
          primary: '#2563EB',
          'primary-hover': '#1D4ED8',
          'primary-soft': '#EAF1FF',
          navy: '#0B1F44',
          'navy-hover': '#12295A',
          'sidebar-active': '#1E4DB7',
          bg: '#F5F7FB',
          surface: '#FFFFFF',
          border: '#E5EAF2',
          text: '#0B1F44',
          'text-2': '#475569',
          muted: '#94A3B8',
          success: '#15803D',
          'success-bg': '#E8F7EE',
          warning: '#D97706',
          'warning-bg': '#FFF3E0',
          danger: '#DC2626',
          'danger-bg': '#FDECEC',
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace']
      },
      borderRadius: {
        'lf-card': '12px',
        'lf-ctl': '8px'
      },
      backdropBlur: { xs: '2px' },
      keyframes: {
        fadeIn: { '0%': { opacity: '0', transform: 'translateY(4px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(.96)' }, '100%': { opacity: '1', transform: 'scale(1)' } }
      },
      animation: { 'fade-in': 'fadeIn .2s ease-out', 'scale-in': 'scaleIn .18s ease-out' },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(11, 31, 68, 0.05)',
        'lf-card': '0 1px 2px rgba(11,31,68,.06), 0 4px 12px rgba(11,31,68,.04)',
        'lf-focus': '0 0 0 3px rgba(37, 99, 235, 0.2)'
      }
    },
  },
  plugins: [],
}
