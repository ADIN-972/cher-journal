/** @type {import('tailwindcss').Config} */
export default {
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
        // Boudoir color scale
        'bg-boudoir-50', 'bg-boudoir-100', 'bg-boudoir-200', 'bg-boudoir-300', 'bg-boudoir-400', 'bg-boudoir-500',
        'bg-boudoir-600', 'bg-boudoir-700', 'bg-boudoir-800', 'bg-boudoir-900', 'bg-boudoir-950',
        'dark:bg-boudoir-800', 'dark:bg-boudoir-900',
        'border-boudoir-200', 'border-boudoir-300', 'border-boudoir-800',
        'text-boudoir-600', 'text-boudoir-700', 'text-boudoir-900',
        'hover:bg-boudoir-300', 'hover:bg-boudoir-700',
        'dark:bg-card-dark',
        'dark:border-[#4d252f]'
    ],
    darkMode: 'class',
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
                'plum-grey': 'rgb(156 163 175 / <alpha-value>)',
                'light-plum': 'rgb(244 239 241 / <alpha-value>)',
                'border-light': 'rgb(229 231 235 / <alpha-value>)',
                'background-light': 'rgb(253 250 241 / <alpha-value>)',
                'background-dark': 'rgb(26 13 16 / <alpha-value>)',
                'card-dark': 'rgb(45 22 28 / <alpha-value>)',
                'card-border-dark': 'rgb(77 37 47 / <alpha-value>)',
                'text-dark-muted': 'rgb(201 146 160 / <alpha-value>)',
            },
        },
    },
    plugins: [],

};
