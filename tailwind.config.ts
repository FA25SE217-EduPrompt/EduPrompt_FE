import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/**/*.{js,ts,jsx,tsx,html}',
        './app/**/*.{js,ts,jsx,tsx,html}',
    ],
    theme: {
        extend: {
            colors: {
                'brand-primary': 'var(--color-brand-primary)',
                'brand-secondary': 'var(--color-brand-secondary)',
                'brand-highlight': 'var(--color-brand-highlight)',
                'brand-subtle': 'var(--color-brand-subtle)',

                'text-primary': 'var(--color-text-primary)',
                'text-secondary': 'var(--color-text-secondary)',
                'text-on-brand': 'var(--color-text-on-brand)',

                'bg-primary': 'var(--color-bg-primary)',
                'bg-secondary': 'var(--color-bg-secondary)',
            },
            // Do the same for fonts
            fontFamily: {
                sans: 'var(--font-sans)',
                mono: 'var(--font-mono)',
            },
        },
    },
    plugins: [],
};

export default config;