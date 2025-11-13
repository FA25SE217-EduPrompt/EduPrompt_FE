// tailwind.config.ts
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

                'accent-ai': 'var(--color-accent-ai)',
                'accent-ai-subtle': 'var(--color-accent-ai-subtle)',
                'accent-star': 'var(--color-accent-star)',
                'accent-star-subtle': 'var(--color-accent-star-subtle)',
                'accent-subject': 'var(--color-accent-subject)',
                'accent-subject-subtle': 'var(--color-accent-subject-subtle)',
                'accent-grade': 'var(--color-accent-grade)',
                'accent-grade-subtle': 'var(--color-accent-grade-subtle)',
                'accent-type': 'var(--color-accent-type)',
                'accent-type-subtle': 'var(--color-accent-type-subtle)',

                /* --- ADDED NEW BADGE COLORS --- */
                'accent-new': 'var(--color-accent-new)',
                'accent-new-subtle': 'var(--color-accent-new-subtle)',
                'accent-trending': 'var(--color-accent-trending)',
                'accent-trending-subtle': 'var(--color-accent-trending-subtle)',
                /* --- END NEW BADGE COLORS --- */

                'text-primary': 'var(--color-text-primary)',
                'text-secondary': 'var(--color-text-secondary)',
                'text-on-brand': 'var(--color-text-on-brand)',

                'bg-primary': 'var(--color-bg-primary)',
                'bg-secondary': 'var(--color-bg-secondary)',
            },
            fontFamily: {
                sans: 'var(--font-sans)',
                mono: 'var(--font-mono)',
            },
        },
    },
    plugins: [],
};

export default config;