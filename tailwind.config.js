import { fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
const config = {
	darkMode: ['class'],
	content: ['./src/**/*.{html,js,svelte,ts}'],
	safelist: ['dark'],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border) / <alpha-value>)',
				input: 'hsl(var(--input) / <alpha-value>)',
				ring: 'hsl(var(--ring) / <alpha-value>)',
				background: 'hsl(var(--background) / <alpha-value>)',
				foreground: 'hsl(var(--foreground) / <alpha-value>)',
				primary: {
					DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
					foreground: 'hsl(var(--primary-foreground) / <alpha-value>)'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
					foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
					foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
					foreground: 'hsl(var(--muted-foreground) / <alpha-value>)'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
					foreground: 'hsl(var(--accent-foreground) / <alpha-value>)'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
					foreground: 'hsl(var(--popover-foreground) / <alpha-value>)'
				},
				card: {
					DEFAULT: 'hsl(var(--card) / <alpha-value>)',
					foreground: 'hsl(var(--card-foreground) / <alpha-value>)'
				},
				// Semantic surface colors
				surface: {
					DEFAULT: 'hsl(var(--surface) / <alpha-value>)',
					elevated: 'hsl(var(--surface-elevated) / <alpha-value>)',
					hover: 'hsl(var(--surface-hover) / <alpha-value>)'
				},
				// Semantic text colors
				'text-primary': 'hsl(var(--text-primary) / <alpha-value>)',
				'text-secondary': 'hsl(var(--text-secondary) / <alpha-value>)',
				'text-tertiary': 'hsl(var(--text-tertiary) / <alpha-value>)',
				'text-inverted': 'hsl(var(--text-inverted) / <alpha-value>)',
				// Interactive colors
				interactive: {
					DEFAULT: 'hsl(var(--interactive) / <alpha-value>)',
					hover: 'hsl(var(--interactive-hover) / <alpha-value>)',
					active: 'hsl(var(--interactive-active) / <alpha-value>)'
				},
				// Chip/filter colors
				chip: {
					DEFAULT: 'hsl(var(--chip) / <alpha-value>)',
					active: 'hsl(var(--chip-active) / <alpha-value>)',
					'active-foreground': 'hsl(var(--chip-active-foreground) / <alpha-value>)'
				},
				// Progress colors
				progress: {
					DEFAULT: 'hsl(var(--progress-bg) / <alpha-value>)',
					border: 'hsl(var(--progress-border) / <alpha-value>)'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				sans: [...fontFamily.sans],
				poppins: ['Poppins', 'Arial', 'sans-serif'],
				mono: ['JetBrains Mono', 'Fira Code', 'SF Mono', 'Menlo', 'monospace']
			}
		}
	},
	plugins: [require('daisyui')]
};

export default config;
