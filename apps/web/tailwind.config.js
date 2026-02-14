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
        // Eros notification colors
        'border-l-4 border-eros-gold',
        'bg-eros-gold/20',
        'text-eros-gold',
        'border-l-4 border-eros-pink',
        'bg-eros-pink/10',
        'text-eros-pink',
        'border-l-4 border-eros-lavender',
        'bg-eros-lavender/20',
        'text-eros-lavender',
        'border-l-4 border-eros-amber',
        'bg-eros-amber/20',
        'text-eros-amber',
        'bg-eros-gold',
        'bg-eros-pink',
        'bg-eros-lavender',
        'bg-eros-amber',
        'shadow-lg shadow-eros-pink/20',
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
                // Eros notification colors
                'eros-gold': '#d4af37',
                'eros-pink': '#e91e63',
                'eros-lavender': '#b39ddb',
                'eros-amber': '#ffc107',
                // Primary accent (warm red/burgundy) with opacity support
                'primary': 'rgb(139 41 66 / <alpha-value>)',
                'primary-light': '#a83a56',
                // Background colors with opacity support
                'background-dark': 'rgb(26 13 16 / <alpha-value>)',
                'parchment': 'rgb(253 250 241 / <alpha-value>)',
                'charcoal': 'rgb(51 51 51 / <alpha-value>)',
                'boudoir': 'rgb(139 94 60 / <alpha-value>)',
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
