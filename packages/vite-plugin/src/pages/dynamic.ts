import { resolve } from 'pathe';
import { createJiti } from 'jiti';
import type { ViteDevServer, ResolvedConfig as ViteResolvedConfig } from 'vite';
import type { PageRecord, ExpandedPage } from '@/types/config.js';
import { getAllModuleDependencies } from '@/graph/index.js';
import { logWarning } from '@/utils/logger.js';
import type { DynamicEntry } from '@hidrajs/loader';

export interface DynamicPageDeps {
	pagePath: string;
	deps: Set<string>;
}

export interface ExpandDynamicPagesResult {
	expanded: ExpandedPage[];
	deps: DynamicPageDeps[];
}

export const expandDynamicPages = async (
	pages: PageRecord[],
	server: ViteDevServer | undefined,
	viteConfig: ViteResolvedConfig | undefined
): Promise<ExpandDynamicPagesResult> => {
	const dynamicPages = pages.filter((page) => page.type === 'dynamic');
	const expanded: ExpandedPage[] = [];
	const deps: DynamicPageDeps[] = [];

	for (const page of dynamicPages) {
		const result = await loadDynamicEntries(page.path, server, viteConfig);

		for (const entry of result.entries) {
			const outputPath = buildOutputPath(page.path, entry.params);
			expanded.push({
				...page,
				outputPath,
				params: entry.params,
				props: entry.props,
			});
		}

		if (result.deps) {
			deps.push({ pagePath: page.path, deps: result.deps });
		}
	}

	return { expanded, deps };
};

interface LoadDynamicEntriesResult {
	entries: DynamicEntry[];
	deps: Set<string> | null;
}

const loadDynamicEntries = async (
	pagePath: string,
	server: ViteDevServer | undefined,
	viteConfig: ViteResolvedConfig | undefined
): Promise<LoadDynamicEntriesResult> => {
	const root = viteConfig?.root || process.cwd();
	const dataPath = resolve(root, pagePath.replace(/\.hbs$/, '.data.ts'));

	let mod: Record<string, unknown>;
	let deps: Set<string> | null = null;

	if (server) {
		mod = await server.ssrLoadModule(dataPath);
		const moduleNode = server.moduleGraph.getModuleById(dataPath);
		deps = getAllModuleDependencies(moduleNode);
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
		mod = await jiti.import(dataPath);
	}

	const dynamicFn = mod.dynamic || mod.default;

	if (typeof dynamicFn !== 'function') {
		throw new Error('Data file must export a dynamic() function: ' + dataPath);
	}

	const entries = await dynamicFn();

	if (!Array.isArray(entries)) {
		throw new Error('dynamic() must return an array: ' + dataPath);
	}

	if (entries.length === 0) {
		logWarning('dynamic() returned empty array for ' + dataPath);
	}

	return { entries: entries as DynamicEntry[], deps };
};

const buildOutputPath = (pagePath: string, params: Record<string, string>): string => {
	const relativePath = pagePath.replace(/^src\/pages\//, '');
	let outputPath = relativePath;

	for (const [key, value] of Object.entries(params)) {
		outputPath = outputPath.replace('[' + key + ']', value);
	}

	return outputPath.replace(/\.hbs$/, '.html');
};
