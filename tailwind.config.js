/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				poppins: ['Poppins', 'Arial', 'sans-serif']
			}
		}
	},
	plugins: [require('daisyui')]
};
