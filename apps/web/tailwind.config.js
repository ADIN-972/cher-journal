/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    safelist: [
        // Force generation of opacity variants for custom colors
        'dark:bg-background-dark/60',
        'dark:bg-background-dark/95',
        'dark:bg-background-dark/70',
        'bg-white/60',
        'bg-white/95',
        'bg-gold/10',
        'bg-gold/20',
        'bg-gold/30',
        'border-gold/20',
        'border-gold/30',
        'border-gold/50',
        'text-gold/60',
        'hover:bg-gold/10',
        'hover:bg-gold/20',
        'hover:border-gold/50',
        'text-charcoal',
        'bg-charcoal',
        'border-charcoal',
        // Boudoir color scale
        'bg-boudoir-50', 'bg-boudoir-100', 'bg-boudoir-200', 'bg-boudoir-300', 'bg-boudoir-400', 'bg-boudoir-500',
        'bg-boudoir-600', 'bg-boudoir-700', 'bg-boudoir-800', 'bg-boudoir-900', 'bg-boudoir-950',
        'dark:bg-boudoir-800', 'dark:bg-boudoir-900',
        'border-boudoir-200', 'border-boudoir-300', 'border-boudoir-800',
        'text-boudoir-600', 'text-boudoir-700', 'text-boudoir-900',
        'hover:bg-boudoir-300', 'hover:bg-boudoir-700',
        // Eros luxury color palette
        'border-l-4 border-eros-gold',
        'bg-eros-gold/5', 'bg-eros-gold/10', 'bg-eros-gold/20', 'bg-eros-gold/30', 'bg-eros-gold/40', 'bg-eros-gold/50',
        'text-eros-gold',
        'border-eros-gold', 'border-eros-gold/10', 'border-eros-gold/20', 'border-eros-gold/30', 'border-eros-gold/40',
        'shadow-eros-gold/20', 'shadow-lg shadow-eros-gold/50',
        'border-l-4 border-eros-pink',
        'bg-eros-pink/5', 'bg-eros-pink/10', 'bg-eros-pink/20', 'bg-eros-pink/30',
        'text-eros-pink',
        'border-eros-pink', 'border-eros-pink/20', 'border-eros-pink/30',
        'shadow-eros-pink/20',
        'border-l-4 border-eros-lavande',
        'bg-eros-lavande/5', 'bg-eros-lavande/10', 'bg-eros-lavande/20', 'bg-eros-lavande/30',
        'text-eros-lavande',
        'border-eros-lavande', 'border-eros-lavande/30', 'border-eros-lavande/40',
        'bg-eros-amber/5', 'bg-eros-amber/20',
        'text-eros-amber',
        'from-eros-gold', 'to-eros-gold/80',
        'from-eros-pink', 'to-eros-pink/80',
        'from-eros-lavande', 'to-eros-lavande/80',
        'hover:bg-eros-gold/10', 'hover:text-eros-gold',
        'hover:bg-eros-lavande/30',
    ],
    theme: {
        extend: {
            colors: {
                // Deep chocolate brown palette
                'boudoir': {
                    50: '#fdf8f6',
                    100: '#f2e8e5',
                    200: '#eaddd7',
                    300: '#e0cec7',
                    400: '#d2bab0',
                    500: '#bfa094',
                    600: '#a18072',
                    700: '#977669',
                    800: '#846358',
                    900: '#43302b',
                    950: '#1a0f0a', // Deep background
                },
                // Gold accents (with opacity support)
                'gold': {
                    DEFAULT: 'rgb(197 160 89 / <alpha-value>)',
                    light: '#e6c84a',
                    dark: '#9a7b1a',
                    muted: 'rgba(201, 162, 39, 0.7)',
                },
                // Eros luxury color palette (with opacity support)
                'eros-gold': 'rgb(212 175 55 / <alpha-value>)',
                'eros-pink': 'rgb(233 30 99 / <alpha-value>)',
                'eros-lavande': 'rgb(179 157 219 / <alpha-value>)',
                'eros-amber': 'rgb(255 193 7 / <alpha-value>)',
                // Primary accent (warm red/burgundy) with opacity support
                'primary': 'rgb(139 41 66 / <alpha-value>)',
                'primary-light': '#a83a56',
                // Background colors with opacity support
                'background-dark': 'rgb(26 13 16 / <alpha-value>)',
                'parchment': 'rgb(253 250 241 / <alpha-value>)',
                'charcoal': 'rgb(51 51 51 / <alpha-value>)',
                'gold': 'rgb(197 160 89 / <alpha-value>)',
                'velvet-brown': 'rgb(45 27 20 / <alpha-value>)',
                'background-light': 'rgb(253 250 241 / <alpha-value>)',
                'rose-gold': 'rgb(212 165 154 / <alpha-value>)',
                'primary-caramel': 'rgb(139 94 60 / <alpha-value>)',
                'charcoal-soft': 'rgb(42 36 32 / <alpha-value>)',
                'powder-pink': 'rgb(232 180 184 / <alpha-value>)',
                // Light mode palette
                'light': {
                    background: '#f5f3f0',
                    surface: '#ffffff',
                    text: '#1a0f0a',
                    border: '#e0cec7',
                },
                'boudoir-plum': '#2D1B2D',
                'boudoir-gold': '#D4AF37',
                'boudoir-silk': '#F3E5F5',
                'deep-burgundy': '#4A0E0E',
                'deep-green': '#0E2F21',
                'midnight-blue': '#0B162C',
            },
            fontFamily: {
                serif: ['Playfair Display', 'Georgia', 'serif'],
                script: ['Great Vibes', 'cursive'],
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-boudoir': 'linear-gradient(135deg, #1a0f0a 0%, #2d1810 50%, #1a0f0a 100%)',
                'gradient-gold': 'linear-gradient(135deg, #c9a227 0%, #e6c84a 50%, #c9a227 100%)',
            },
            keyframes: {
                'slide-in': {
                    '0%': {
                        transform: 'translateX(400px)',
                        opacity: '0',
                    },
                    '100%': {
                        transform: 'translateX(0)',
                        opacity: '1',
                    },
                },
            },
            animation: {
                'slide-in': 'slide-in 0.3s ease-out',
            },
        },
    },
    plugins: [],
};
