import type { PluginState } from '../state/generator.js';
import type { ViteDevServer } from 'vite';
import type { PageRecord, ExpandedPage } from '@/types/config.js';
import { HidraError } from '@/utils/error';
import { ERRORS } from '@/utils/errors';
import { logError } from '@/utils/logger';

interface MiddlewareOptions {
	state: PluginState;
	getPageByOutputPath: (outputPath: string) => PageRecord | ExpandedPage | undefined;
	getPageByUrl: (url: string) => PageRecord | ExpandedPage | undefined;
	renderPageHtml: (
		page: PageRecord | ExpandedPage,
		url: string,
		server: ViteDevServer
	) => Promise<string>;
	setupHandlebars: (server: ViteDevServer) => Promise<void>;
}

const transformDevAssetPaths = (html: string): string => {
	return html
		.replace(/href=["']\.\/src\/([^"']+\.css)["']/g, 'href="/src/$1"')
		.replace(/src=["']\.\/src\/([^"']+\.ts)["']/g, 'src="/src/$1"')
		.replace(/href=["']\.\/src\/([^"']+\.js)["']/g, 'href="/src/$1"');
};

/**
 * Creates Express-style middleware for dev server page rendering.
 * Handles page lookup, rendering, and error handling.
 */
export const createMiddleware = (options: MiddlewareOptions) => {
	return async (req: unknown, res: unknown, next: () => void) => {
		const nodeReq = req as { url?: string };
		const nodeRes = res as {
			setHeader: (key: string, value: string) => void;
			end: (data: string) => void;
			statusCode: number;
		};

		if (!nodeReq.url) {
			next();
			return;
		}

		const url = nodeReq.url.split('?')[0];

		if (!url) {
			next();
			return;
		}

		const hasExtension = /\.[a-zA-Z]+$/.test(url);
		if (hasExtension && !url.endsWith('.html')) {
			next();
			return;
		}

		try {
			await options.setupHandlebars(options.state.viteServer!);
			const page = options.getPageByUrl(url);

			if (!page) {
				next();
				return;
			}

			let html = await options.renderPageHtml(page, url, options.state.viteServer!);
			html = transformDevAssetPaths(html);
			html = await options.state.viteServer!.transformIndexHtml(url, html);

			nodeRes.setHeader('Content-Type', 'text/html; charset=utf-8');
			nodeRes.end(html);
		} catch (error) {
			logError('[Hidra Middleware Error]', error);
			if (isNotFoundError(error)) {
				nodeRes.statusCode = 404;
				nodeRes.end('404 Not Found');
				return;
			}
			nodeRes.statusCode = 500;
			nodeRes.end(
				`500 Internal Server Error: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	};
};

const isNotFoundError = (error: unknown): boolean => {
	if (error instanceof HidraError) return error.type === ERRORS.DYNAMIC_LOAD_FAILED;
	return false;
};
