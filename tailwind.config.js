/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chaos': {
          'primary': '#667eea',
          'secondary': '#764ba2', 
          'accent': '#f093fb',
          'bg': '#0f0f23',
          'surface': '#1a1a2e',
          'text': '#e0e0e0'
        }
      },
      animation: {
        'float': 'float 20s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { 
            transform: 'translateY(0px) rotate(0deg)' 
          },
          '33%': { 
            transform: 'translateY(-20px) rotate(1deg)' 
          },
          '66%': { 
            transform: 'translateY(10px) rotate(-1deg)' 
          }
        },
        'gradient-shift': {
          '0%, 100%': { 
            'background-position': '0% 50%' 
          },
          '50%': { 
            'background-position': '100% 50%' 
          }
        }
      },
      backgroundImage: {
        'chaos-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'chaos-surface': 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'chaos': '0 4px 20px rgba(102, 126, 234, 0.3)',
        'chaos-lg': '0 8px 32px rgba(102, 126, 234, 0.4)',
      }
    },
  },
  plugins: [],
}