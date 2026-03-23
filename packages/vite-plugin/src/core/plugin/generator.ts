import { resolveConfig } from '@/core/config';
import {
	findPageByOutputPath,
	findPageByOutputPathInExpanded,
	findPageByUrl,
	findPageByUrlInExpanded,
} from '@/core/pages/lookup';
import { createHidraPlugin, createPluginHelpers } from '@/core/plugin/helpers';
import { renderPageForDev } from '@/core/rendering/renderer';
import { createMiddleware } from '@/core/server/middleware';
import { setupDevServerUrl } from '@/core/server/setup';
import { handleHotUpdate, setupHmrWatcher } from '@/core/server/watcher';
import { setupHandlebars } from '@/core/state/handlebars';
import { createState, updateExpandedPages } from '@/core/state/generator';
import { expandDynamicPages } from '@/pages/dynamic';
import type { HidraOptions } from '@/types/config';
import type { Plugin, ViteDevServer } from 'vite';

export const createPlugin = (options?: HidraOptions): Plugin[] => {
	const config = resolveConfig(options);
	const state = createState(config);
	const helpers = createPluginHelpers(state, config);

	const plugins = createHidraPlugin(config, state);
	const dependencies = new Map<string, Set<string>>();

	plugins.configureServer = (server: ViteDevServer) => {
		setupDevServerUrl(state, server);

		const initialize = async (): Promise<void> => {
			const pages = state.pages.filter((page) => page.type === 'dynamic');
			const result = await expandDynamicPages(pages, server, undefined);
			updateExpandedPages(state, result.expanded);
			for (const dep of result.deps) {
				dependencies.set(dep.pagePath, dep.deps);
			}
		};

		(async () => {
			await initialize();
		})();

		const middleware = createMiddleware({
			state,
			getPageByOutputPath: (output) => {
				const page = findPageByOutputPath(state.pages, output);
				return page || findPageByOutputPathInExpanded(state.expandedPages, output);
			},
			getPageByUrl: (url) => {
				const page = findPageByUrl(state.pages, url);
				return page || findPageByUrlInExpanded(state.expandedPages, url);
			},
			renderPageHtml: async (page, url, srv) => renderPageForDev(page, url, srv, state),
			setupHandlebars: () => setupHandlebars(state),
		});

		server.middlewares.use(middleware);
		setupHmrWatcher({ state, helpers }, server);
	};

	plugins.handleHotUpdate = async ({ file, server }) => {
		await handleHotUpdate(file, server, { state, helpers });
		return [];
	};

	return [plugins];
};

export default createPlugin;
