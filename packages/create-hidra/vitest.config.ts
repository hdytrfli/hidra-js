import { defineConfig } from 'vitest/config';
import { resolve } from 'pathe';

export default defineConfig({
	test: {
		name: '@hidrajs/create-hidra',
		environment: 'node',
		include: ['tests/**/*.test.ts'],
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src'),
		},
	},
});
