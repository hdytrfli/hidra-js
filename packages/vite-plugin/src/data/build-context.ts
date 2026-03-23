import type { PluginState } from '@/core/state/generator';
import { loadGlobalData } from '@/data/global';
import { loadPageData } from '@/data/page';
import type { ExpandedPage, PageRecord } from '@/types/config';
import type { ViteDevServer } from 'vite';

/**
 * Builds render context for expanded dynamic pages.
 * Merges global data, page data, and page metadata.
 */
export const buildRenderContext = async (
	page: ExpandedPage,
	state: PluginState,
	server?: ViteDevServer
): Promise<Record<string, unknown>> => {
	const config = server ? server.config : undefined;
	const props = await loadPageData(page.path, page, server, config);
	const global = await loadGlobalData(state.config.global, state.reloadTimestamp, server, config);

	const meta = {
		url: buildUrlFromExpandedPage(page),
		props: props,
		path: page.path,
		params: page.params,
		type: 'dynamic' as const,
	};

	return {
		...global,
		...props,
		page: {
			...meta,
		},
	};
};

/**
 * Builds render context for static pages.
 * Merges global data, page data, and page metadata.
 */
export const buildStaticRenderContext = async (
	page: PageRecord,
	state: PluginState,
	server?: ViteDevServer
): Promise<Record<string, unknown>> => {
	const config = server ? server.config : undefined;
	const props = await loadPageData(page.path, page, server, config);
	const global = await loadGlobalData(state.config.global, state.reloadTimestamp, server, config);

	const meta = {
		props: props,
		path: page.path,
		type: 'static' as const,
		url: page.outputPath ? '/' + page.outputPath : '/',
	};

	return {
		...global,
		...props,
		page: {
			...meta,
		},
	};
};

const buildUrlFromExpandedPage = (page: ExpandedPage): string => {
	const url = page.outputPath || '/';
	return url.startsWith('/') ? url : '/' + url;
};
