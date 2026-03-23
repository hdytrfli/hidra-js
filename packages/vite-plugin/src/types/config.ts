import type { PageMeta } from '@hidrajs/loader';

export interface HidraOptions {
	global?: string;
	pages?: { dir: string };
	layouts?: { dir: string };
	helpers?: { dir: string };
	components?: { dir: string };
}

export interface ResolvedConfig {
	global: string;
	pages: { dir: string };
	layouts: { dir: string };
	helpers: { dir: string };
	components: { dir: string };
}

/**
 * Internal page representation used by the plugin.
 * Extends PageMeta with plugin-specific metadata.
 */
export interface PageRecord extends Omit<PageMeta, 'url'> {
	id: string;
	dataPath?: string;
	outputPath: string | undefined;
}

export type ExpandedPage = PageRecord;
