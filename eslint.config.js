import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

const IGNORES = ['**/dist/**', '**/cache/**', '**/node_modules/**', '**/*.cjs', '**/coverage/**'];

export default defineConfig([
	globalIgnores(IGNORES),
	{
		files: ['**/*.{ts,tsx}'],
		extends: [js.configs.recommended, tseslint.configs.recommended, eslintConfigPrettier],
		plugins: { prettier: eslintPluginPrettier },
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/explicit-function-return-type': [
				'error',
				{
					allowExpressions: true,
					allowHigherOrderFunctions: true,
					allowTypedFunctionExpressions: true,
					allowDirectConstAssertionInArrowFunctions: true,
				},
			],
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
				},
			],
			'no-empty': 'off',
			'prettier/prettier': 'error',
		},
	},
	{
		files: ['**/*.test.ts', '**/*.spec.ts'],
		rules: {
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
		},
	},
]);
