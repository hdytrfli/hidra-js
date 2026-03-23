import type { Plugin, ViteDevServer } from 'vite';
import type { ResolvedConfig } from '@/types/config';
import { createDevHooks } from '@/core/plugin/hooks-dev';
import { createBuildHooks } from '@/core/plugin/hooks-build';
import { type PluginState, updatePages, updateExpandedPages } from '@/core/state/generator';
import { discoverPages } from '@/pages/discovery';
import { expandDynamicPages } from '@/pages/dynamic';

/**
 * Helper functions for plugin page discovery and dynamic page expansion.
 * Used for HMR to re-discover and re-expand pages when files change.
 */
export interface PluginHelpers {
	/**
	 * Re-discover all pages from the pages directory.
	 * Called when page files are added or removed.
	 */
	rediscoverPages: (server: ViteDevServer) => Promise<void>;
	/**
	 * Re-expand only dynamic pages affected by a file change.
	 * Uses dependency tracking to find which pages depend on the changed file.
	 */
	reexpandAffectedDynamicPages: (changedFile: string, server: ViteDevServer) => Promise<void>;
}

/**
 * Creates helper functions for page discovery and dynamic page expansion.
 * Tracks dependencies for each dynamic page to enable efficient HMR.
 */
export const createPluginHelpers = (state: PluginState, config: ResolvedConfig): PluginHelpers => {
	const dynamicPageDeps = new Map<string, Set<string>>();
	let isReexpanding = false;

	const rediscoverPages = async (server: ViteDevServer): Promise<void> => {
		const pages = await discoverPages(config.pages.dir);
		updatePages(state, pages);

		const dynamicPages = pages.filter((page) => page.type === 'dynamic');
		const result = await expandDynamicPages(dynamicPages, server, undefined);

		dynamicPageDeps.clear();
		for (const dep of result.deps) {
			dynamicPageDeps.set(dep.pagePath, dep.deps);
		}

		updateExpandedPages(state, result.expanded);
	};

	const reexpandAffectedDynamicPages = async (
		changedFile: string,
		server: ViteDevServer
	): Promise<void> => {
		if (isReexpanding) return;
		isReexpanding = true;

		try {
			const affectedPages = state.pages.filter((page) => {
				if (page.type !== 'dynamic') return false;
				const dependencies = dynamicPageDeps.get(page.path);
				return dependencies && dependencies.has(changedFile);
			});

			if (affectedPages.length === 0) return;
			const result = await expandDynamicPages(affectedPages, server, undefined);

			for (const dependecy of result.deps) {
				dynamicPageDeps.set(dependecy.pagePath, dependecy.deps);
			}

			const unaffectedExpanded = state.expandedPages.filter((expanded) => {
				return !affectedPages.some((affected) => affected.path === expanded.path);
			});

			updateExpandedPages(state, [...unaffectedExpanded, ...result.expanded]);
		} finally {
			isReexpanding = false;
		}
	};

	return { rediscoverPages, reexpandAffectedDynamicPages };
};

/**
 * Creates the main Hidra Vite plugin instance.
 * Combines build hooks and dev hooks into a single plugin.
 */
export const createHidraPlugin = (config: ResolvedConfig, state: PluginState): Plugin => {
	const buildHooks = createBuildHooks({ state, config });
	const devHooks = createDevHooks({ state });

	return {
		name: 'hidra',
		enforce: 'pre',
		...buildHooks,
		...devHooks,
	};
};
