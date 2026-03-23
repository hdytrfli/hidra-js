import { defineConfig } from 'vite';
import hidra from '@hidrajs/vite-plugin';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [hidra(), tailwindcss()],
	resolve: {
		alias: { '@': '/src' },
	},
});
