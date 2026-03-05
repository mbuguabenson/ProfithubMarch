/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'dark-bg': '#050505',
                'glass-bg': 'rgba(255, 255, 255, 0.02)',
                'brand-blue': '#3b82f6',
                'brand-purple': '#a855f7',
                'brand-cyan': '#06b6d4',
                'brand-emerald': '#10b981',
                'brand-rose': '#f43f5e',
            },
            backdropBlur: {
                xs: '2px',
                'xl': '24px',
                '2xl': '40px',
            },
            boxShadow: {
                'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
                'glow-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
                'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.3)',
                'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.3)',
                'glow-rose': '0 0 20px rgba(244, 63, 94, 0.3)',
            },
            letterSpacing: {
                tighter: '-0.05em',
            }
        },
    },
    plugins: [],
    darkMode: 'class',
}
