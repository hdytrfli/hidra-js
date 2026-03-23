import { defineConfig } from 'vitest/config';
import { resolve } from 'pathe';

export default defineConfig({
	test: {
		environment: 'node',
		name: '@hidrajs/vite-plugin',
		include: ['tests/**/*.test.ts'],
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src'),
		},
	},
});
