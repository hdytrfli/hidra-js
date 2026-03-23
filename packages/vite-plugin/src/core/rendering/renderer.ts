import type { PageRecord, ExpandedPage } from '@/types/config.js';
import type { ViteDevServer } from 'vite';
import type { PluginState } from '@/core/state/generator.js';
import { setupHandlebars } from '@/core/state/handlebars.js';
import { loadGlobalData } from '@/data/global.js';
import { loadPageData } from '@/data/page.js';
import merge from 'lodash.merge';

/**
 * Renders a page for development server.
 * Builds context and compiles Handlebars template.
 */
export const renderPageForDev = async (
	page: PageRecord | ExpandedPage,
	url: string,
	server: ViteDevServer,
	state: PluginState
): Promise<string> => {
	const context = await buildDevContext(page, state, server);
	const fs = await import('node:fs/promises');
	const source = await fs.readFile(page.path, 'utf-8');

	if (!state.handlebarsInstance) await setupHandlebars(state);
	return state.handlebarsInstance!.compile(source)(context);
};

/**
 * Renders a page for production build.
 * Builds context and compiles Handlebars template.
 */
export const renderPageForBuild = async (
	page: PageRecord | ExpandedPage,
	state: PluginState
): Promise<string> => {
	const context = await buildRenderContext(page, state);
	const fs = await import('node:fs/promises');
	const template = await fs.readFile(page.path, 'utf-8');

	if (!state.handlebarsInstance) throw new Error('Handlebars instance not initialized');

	return state.handlebarsInstance!.compile(template)(context);
};

const buildDevContext = async (
	page: PageRecord | ExpandedPage,
	state: PluginState,
	server: ViteDevServer
): Promise<Record<string, unknown>> => {
	const globalData = await loadGlobalData(
		state.config.global,
		state.reloadTimestamp,
		server,
		server.config
	);

	const hasProps = page.props && Object.keys(page.props).length > 0;
	const isExpandedDynamicPage = page.type === 'dynamic' && page.outputPath && hasProps;
	const pageProps = isExpandedDynamicPage
		? page.props
		: await loadPageData(page.path, page, server, server.config);
	const pageMeta = buildPageMeta(page, pageProps);

	return merge({}, globalData, pageProps, { page: pageMeta });
};

const buildRenderContext = async (
	page: PageRecord | ExpandedPage,
	state: PluginState
): Promise<Record<string, unknown>> => {
	const globalData = await loadGlobalData(
		state.config.global,
		state.reloadTimestamp,
		undefined,
		undefined
	);

	const hasProps = page.props && Object.keys(page.props).length > 0;
	const isExpandedDynamicPage = page.type === 'dynamic' && page.outputPath && hasProps;
	const pageProps = isExpandedDynamicPage
		? page.props
		: await loadPageData(page.path, page, undefined, undefined);
	const pageMeta = buildPageMeta(page, pageProps);

	return merge({}, globalData, pageProps, { page: pageMeta });
};

const buildPageMeta = (
	page: PageRecord | ExpandedPage,
	pageProps: Record<string, unknown>
): Record<string, unknown> => {
	const buildPageUrl = (page: PageRecord | ExpandedPage): string => {
		if ('outputPath' in page && page.outputPath) return '/' + page.outputPath;
		return '/';
	};

	const url = buildPageUrl(page);

	const meta: Record<string, unknown> = {
		url,
		props: pageProps,
		path: page.path,
		type: page.type,
	};

	if (page.type === 'dynamic') meta.params = page.params;

	return meta;
};
