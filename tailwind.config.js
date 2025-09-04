/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg': 'hsl(0, 0%, 98%)',
        'text': 'hsl(220, 10%, 20%)',
        'accent': 'hsl(130, 70%, 50%)',
        'primary': 'hsl(210, 80%, 50%)',
        'surface': 'hsl(0, 0%, 100%)',
        'dark': {
          'bg': 'hsl(240, 15%, 8%)',
          'surface': 'hsl(240, 12%, 12%)',
          'border': 'hsl(240, 8%, 20%)',
          'text': 'hsl(0, 0%, 95%)',
          'text-muted': 'hsl(0, 0%, 65%)',
        },
        'purple': {
          500: 'hsl(270, 80%, 60%)',
          600: 'hsl(270, 80%, 50%)',
        },
        'cyan': {
          400: 'hsl(180, 80%, 60%)',
          500: 'hsl(180, 80%, 50%)',
        }
      },
      borderRadius: {
        'lg': '12px',
        'md': '8px',
        'sm': '4px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(0, 0%, 0%, 0.1)',
        'modal': '0 16px 48px hsla(0, 0%, 0%, 0.16)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slideUp 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      }
    },
  },
  plugins: [],
}