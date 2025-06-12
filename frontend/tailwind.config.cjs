/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(0 0% 90%)",
        input: "hsl(0 0% 95%)",
        ring: "hsl(0 0% 0%)",
        background: "hsl(0 0% 100%)",
        foreground: "hsl(0 0% 0%)",
        primary: {
          DEFAULT: "hsl(0 0% 0%)",
          foreground: "hsl(0 0% 100%)",
        },
        secondary: {
          DEFAULT: "hsl(0 0% 95%)",
          foreground: "hsl(0 0% 0%)",
        },
        muted: {
          DEFAULT: "hsl(0 0% 96%)",
          foreground: "hsl(0 0% 40%)",
        },
        accent: {
          DEFAULT: "hsl(0 0% 95%)",
          foreground: "hsl(0 0% 0%)",
        },
        destructive: {
          DEFAULT: "hsl(0 0% 20%)",
          foreground: "hsl(0 0% 100%)",
        },
        card: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(0 0% 0%)",
        },
        popover: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(0 0% 0%)",
        },
        'privyde-black': '#000000',
        'privyde-white': '#FFFFFF',
        'privyde-gray': {
          50: '#F9F9F9',
          100: '#F3F3F3',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        'conthrax': ['ConthraxSb', 'sans-serif'],
        'panton': ['Panton', 'sans-serif'],
        'sans': ['Panton', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        grid: "grid 15s linear infinite",
      },
      keyframes: {
        grid: {
          "0%": { transform: "translateY(-50%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%',
            color: '#000000',
            textAlign: 'left',
            fontFamily: 'Panton, sans-serif',
            a: {
              color: '#000000',
              textDecoration: 'underline',
              fontWeight: '500',
            },
            p: {
              textAlign: 'left',
              color: '#000000',
            },
            li: {
              textAlign: 'left',
              color: '#000000',
            },
            h1: {
              fontFamily: 'ConthraxSb, sans-serif',
              fontWeight: '700',
              letterSpacing: '-0.025em',
              color: '#000000',
            },
            h2: {
              fontFamily: 'ConthraxSb, sans-serif',
              fontWeight: '600',
              letterSpacing: '-0.025em',
              color: '#000000',
            },
            h3: {
              fontFamily: 'ConthraxSb, sans-serif',
              fontWeight: '500',
              color: '#000000',
            },
            img: {
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              marginTop: '2rem',
              marginBottom: '2rem',
            },
            blockquote: {
              fontStyle: 'normal',
              color: '#404040',
              borderLeftColor: '#000000',
            },
            ul: {
              paddingLeft: '1.625em',
            },
            ol: {
              paddingLeft: '1.625em',
            },
            code: {
              color: '#000000',
              borderRadius: '0.25rem',
              padding: '0.25rem 0.375rem',
              backgroundColor: '#F3F3F3',
              fontWeight: '500',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              color: '#FFFFFF',
              backgroundColor: '#000000',
              overflowX: 'auto',
              fontWeight: '400',
              fontSize: '0.875em',
              lineHeight: '1.7142857',
              borderRadius: '0.375rem',
              padding: '1rem',
            },
            'pre code': {
              backgroundColor: 'transparent',
              borderWidth: '0',
              borderRadius: '0',
              padding: '0',
              fontWeight: 'inherit',
              color: 'inherit',
              fontSize: 'inherit',
              lineHeight: 'inherit',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 