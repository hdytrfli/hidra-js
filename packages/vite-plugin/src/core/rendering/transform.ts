import type { ExpandedPage } from '@/types/config.js';
import type { ViteDevServer } from 'vite';
import type { PluginState } from '../state/generator.js';
import { buildRenderContext } from '../../data/build-context.js';
import { renderPageWithLayout } from '../../pages/renderer.js';

/**
 * Transforms HTML by injecting rendered page content.
 * Used in build mode to inject Handlebars output into virtual HTML.
 */
export const transformHtml = async (
	html: string,
	page: ExpandedPage,
	state: PluginState,
	server?: ViteDevServer
): Promise<string> => {
	const context = await buildRenderContext(page, state, server);
	const content = await renderPageWithLayout(
		page.path,
		context,
		state.config,
		state.handlebarsInstance
	);
	return injectContentIntoHtml(html, content);
};

/**
 * Injects rendered content into HTML at the body tag.
 * Falls back to returning content only if no body tag found.
 */
export const injectContentIntoHtml = (html: string, content: string): string => {
	const bodyMatch = html.match(/<body[^>]*>/i);
	if (!bodyMatch || bodyMatch.index === undefined) {
		return content;
	}

	const insertPosition = bodyMatch.index + bodyMatch[0].length;
	return html.slice(0, insertPosition) + '\n' + content + '\n' + html.slice(insertPosition);
};
