import type { HidraOptions, ResolvedConfig } from '@/types/config.js';

const DEFAULT_PAGES_DIR = 'src/pages';
const DEFAULT_LAYOUTS_DIR = 'src/layouts';
const DEFAULT_COMPONENTS_DIR = 'src/components';
const DEFAULT_HELPERS_DIR = 'src/helpers';
const DEFAULT_GLOBAL_FILE = 'src/global.ts';

export const resolveConfig = (options?: HidraOptions): ResolvedConfig => {
	return {
		global: options?.global ?? DEFAULT_GLOBAL_FILE,
		pages: {
			dir: options?.pages?.dir ?? DEFAULT_PAGES_DIR,
		},
		layouts: {
			dir: options?.layouts?.dir ?? DEFAULT_LAYOUTS_DIR,
		},
		components: {
			dir: options?.components?.dir ?? DEFAULT_COMPONENTS_DIR,
		},
		helpers: {
			dir: options?.helpers?.dir ?? DEFAULT_HELPERS_DIR,
		},
	};
};
