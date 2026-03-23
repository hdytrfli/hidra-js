import type { ResolvedConfig, PageRecord, ExpandedPage } from '@/types/config';
import type { ViteDevServer } from 'vite';
import type Handlebars from 'handlebars';

/**
 * Complete state of the Hidra plugin.
 * Tracks pages, Handlebars instance, and build metadata.
 */
export interface PluginState {
	config: ResolvedConfig;
	pages: PageRecord[];
	expandedPages: ExpandedPage[];
	globalData: Record<string, unknown>;
	reloadTimestamp: number;
	handlebarsInstance: typeof Handlebars | null;
	viteServer: ViteDevServer | null;
	buildManifest: Record<string, { file: string }> | null;
	isBuild: boolean;
}

/**
 * Creates initial plugin state from resolved configuration.
 */
export const createState = (config: ResolvedConfig): PluginState => ({
	config,
	pages: [],
	expandedPages: [],
	globalData: {},
	reloadTimestamp: Date.now(),
	handlebarsInstance: null,
	viteServer: null,
	buildManifest: null,
	isBuild: false,
});

/**
 * Sets the Vite dev server instance in state.
 */
export const setViteServer = (state: PluginState, server: ViteDevServer): void => {
	state.viteServer = server;
};

/**
 * Sets the Handlebars instance in state.
 */
export const setHandlebarsInstance = (state: PluginState, instance: typeof Handlebars): void => {
	state.handlebarsInstance = instance;
};

/**
 * Sets the build manifest in state.
 */
export const setBuildManifest = (
	state: PluginState,
	manifest: Record<string, { file: string }>
): void => {
	state.buildManifest = manifest;
};

/**
 * Sets the build mode flag in state.
 */
export const setIsBuild = (state: PluginState, isBuild: boolean): void => {
	state.isBuild = isBuild;
};

/**
 * Updates the pages array in state.
 */
export const updatePages = (state: PluginState, pages: PageRecord[]): void => {
	state.pages = pages;
};

/**
 * Updates the expanded pages array in state.
 */
export const updateExpandedPages = (state: PluginState, expandedPages: ExpandedPage[]): void => {
	state.expandedPages = expandedPages;
};

/**
 * Updates the global data in state.
 */
export const updateGlobalData = (state: PluginState, data: Record<string, unknown>): void => {
	state.globalData = data;
};
