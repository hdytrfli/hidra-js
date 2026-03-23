import type { Plugin, ViteDevServer } from 'vite';
import { updateExpandedPages } from '@/core/state/generator';
import { createMiddleware } from '@/core/server/middleware';
import { setupHandlebars } from '@/core/state/handlebars';
import { renderPageForDev } from '@/core/rendering/renderer';
import { findPageByVirtualPath } from '@/core/pages/lookup';
import { transformHtml } from '@/core/rendering/transform';
import type { PluginState } from '@/core/state/generator';
import { expandDynamicPages } from '@/pages/dynamic';

interface DevHooksOptions {
	state: PluginState;
}

/**
 * Creates Vite plugin hooks for development server operations.
 * Handles middleware setup and HTML transformation in dev mode.
 */
export const createDevHooks = (options: DevHooksOptions): Partial<Plugin> => {
	const { state } = options;

	return {
		configureServer(server: ViteDevServer) {
			(async () => {
				const dynamicPages = state.pages.filter((p) => p.type === 'dynamic');
				const result = await expandDynamicPages(dynamicPages, server, undefined);
				updateExpandedPages(state, result.expanded);
			})();

			const middleware = createMiddleware({
				state,
				getPageByOutputPath: (outputPath) => {
					const page = state.pages.find((p) => p.outputPath === outputPath);
					if (page) return page;
					return state.expandedPages.find((p) => p.outputPath === outputPath);
				},
				getPageByUrl: (url) => {
					const normalized = url.replace(/^\//, '').replace(/\?.*$/, '');
					const target = normalized.endsWith('.html') ? normalized : normalized + '.html';
					const page = state.pages.find((p) => p.outputPath === target);
					if (page) return page;
					return state.expandedPages.find((p) => p.outputPath === target);
				},
				renderPageHtml: async (page, url, srv) => renderPageForDev(page, url, srv, state),
				setupHandlebars: () => setupHandlebars(state),
			});

			server.middlewares.use(middleware);
		},

		async transformIndexHtml(html, ctx) {
			if (!state.isBuild) return html;
			const page = findPageByVirtualPath(ctx.filename, state.pages, state.expandedPages);
			if (!page) return html;
			if ('props' in page) return transformHtml(html, page, state);
			return html;
		},
	};
};
