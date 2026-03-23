import type { PageRecord, ExpandedPage } from '@/types/config.js';
import type { ViteDevServer, ResolvedConfig as ViteResolvedConfig } from 'vite';
import { createJiti } from 'jiti';
import { resolve } from 'pathe';
import { fileExists } from '@/utils/fs.js';

export const loadPageData = async (
	pagePath: string,
	page: PageRecord | ExpandedPage,
	server: ViteDevServer | undefined,
	viteConfig: ViteResolvedConfig | undefined
): Promise<Record<string, unknown>> => {
	const dataPath = pagePath.replace(/\.hbs$/, '.data.ts');

	const root = viteConfig?.root || process.cwd();
	const resolvedPath = resolve(root, dataPath);

	if (!fileExists(resolvedPath)) {
		return {};
	}

	try {
		if (server && server.moduleGraph) {
			const module = server.moduleGraph.getModuleById(resolvedPath);
			if (module) {
				server.moduleGraph.invalidateModule(module);
			}
		}

		let data: unknown;

		if (server) {
			const mod = await server.ssrLoadModule(resolvedPath);
			const fn = mod.default;
			if (typeof fn === 'function') {
				data = await fn({ page: buildPageMeta(page) });
			} else {
				data = fn;
			}
		} else {
			const alias: Record<string, string> = {};
			if (viteConfig?.resolve?.alias) {
				const aliases = Array.isArray(viteConfig.resolve.alias)
					? viteConfig.resolve.alias
					: [viteConfig.resolve.alias];
				for (const a of aliases) {
					if (typeof a === 'object' && 'find' in a && 'replacement' in a) {
						alias[a.find as string] = resolve(root, a.replacement as string);
					}
				}
			}
			alias['@'] = resolve(root, 'src');

			const jiti = createJiti(import.meta.url, {
				cache: false,
				alias,
			});

			const mod = (await jiti.import(resolvedPath)) as { default: unknown };
			const fn = mod.default;
			if (typeof fn === 'function') data = await fn({ page: buildPageMeta(page) });
			else data = fn;
		}

		if (typeof data !== 'object' || data === null) return {};
		return data as Record<string, unknown>;
	} catch {
		return {};
	}
};

const buildPageMeta = (page: PageRecord | ExpandedPage): Record<string, unknown> => {
	const hasParams = 'params' in page;
	const hasProps = 'props' in page;

	const buildPageUrl = (page: PageRecord | ExpandedPage): string => {
		if ('outputPath' in page && page.outputPath) return '/' + page.outputPath;
		if (hasParams) return buildUrlFromParams(page as ExpandedPage);
		return '/';
	};

	const url = buildPageUrl(page);
	const params = hasParams ? page.params : {};
	const props = hasProps ? page.props : {};

	return {
		url,
		props,
		params,
		path: page.path,
		type: page.type,
	};
};

const buildUrlFromParams = (page: ExpandedPage): string => {
	const url = page.outputPath || '/';
	return url.startsWith('/') ? url : '/' + url;
};
