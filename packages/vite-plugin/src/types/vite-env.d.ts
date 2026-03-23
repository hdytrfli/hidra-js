import 'vite/client';

declare global {
	interface ImportMetaEnv {
		readonly VITE_HIDRA_VERSION: string;
		readonly VITE_HIDRA_MODE: 'development' | 'production';
	}

	interface ImportMeta {
		readonly env: ImportMetaEnv;
	}
}

export {};
