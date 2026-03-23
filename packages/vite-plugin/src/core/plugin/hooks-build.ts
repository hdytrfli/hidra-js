import { scanLayoutAssets, transformAssetPaths } from '@/core/assets';
import { getVirtualHtml, isVirtual } from '@/core/pages/virtual';
import { renderPageForBuild } from '@/core/rendering/renderer';
import { setupHandlebarsForBuild } from '@/core/state/handlebars';
import {
	setIsBuild,
	updateExpandedPages,
	updatePages,
	type PluginState,
} from '@/core/state/generator';
import { loadGlobalData } from '@/data/global';
import type { ResolvedConfig } from '@/types/config';
import type { Plugin } from 'vite';

import { version as hidraVersion } from '../../../package.json';
import { discoverPages } from '@/pages/discovery';
import { expandDynamicPages } from '@/pages/dynamic';

interface BuildHooksOptions {
	state: PluginState;
	config: ResolvedConfig;
}

/**
 * Creates Vite plugin hooks for build-time operations.
 * Handles page discovery, Handlebars setup, and static site generation.
 */
export const createBuildHooks = (options: BuildHooksOptions): Partial<Plugin> => {
	const { state, config } = options;

	return {
		async config(_, env) {
			setIsBuild(state, env.command === 'build');

			const pages = await discoverPages(config.pages.dir);
			updatePages(state, pages);

			return {
				define: {
					'import.meta.env.VITE_HIDRA_VERSION': JSON.stringify(hidraVersion),
					'import.meta.env.VITE_HIDRA_MODE': JSON.stringify(
						env.command === 'build' ? 'production' : 'development'
					),
				},
				build: {
					manifest: true,
					rollupOptions: {
						input: {
							_hidra_entry: 'virtual:hidra-entry',
						},
					},
				},
			};
		},

		async buildStart() {
			if (!state.isBuild) return;

			await setupHandlebarsForBuild(state);

			const dynamicPages = state.pages.filter((p) => p.type === 'dynamic');
			const result = await expandDynamicPages(dynamicPages, undefined, undefined);
			updateExpandedPages(state, result.expanded);

			state.globalData = await loadGlobalData(
				state.config.global,
				state.reloadTimestamp,
				undefined,
				undefined
			);
		},

		async generateBundle(options, bundle) {
			if (!state.isBuild) return;

			const manifest = extractManifestFromBundle(bundle);
			state.buildManifest = manifest || null;

			await emitPages(this, state, renderPageForBuild);
		},

		async writeBundle(options) {
			if (!state.isBuild) return;

			const manifest = await loadBuildManifest(options.dir);
			if (!manifest) return;

			await updateHtmlWithAssetPaths(
				options.dir || 'dist',
				manifest,
				state.pages,
				state.expandedPages
			);
		},

		resolveId(id) {
			if (isVirtual(id)) return { id, external: false };
			if (id === 'virtual:hidra-entry') return { id, external: false };
			return null;
		},

		load(id) {
			if (id === 'virtual:hidra-entry') {
				const assetImports = scanLayoutAssets(config.layouts.dir);
				return assetImports.map((p) => `import "${p}";`).join('\n') + '\nexport default {};';
			}
			if (isVirtual(id)) return getVirtualHtml();
			return null;
		},
	};
};

const extractManifestFromBundle = (
	bundle: Record<string, unknown>
): Record<string, { file: string; css?: string[] }> | undefined => {
	for (const [key, chunk] of Object.entries(bundle)) {
		if (key.includes('manifest.json') && (chunk as { type: string }).type === 'asset') {
			try {
				return JSON.parse((chunk as { source: string }).source);
			} catch {
				return undefined;
			}
		}
	}
	return undefined;
};

const emitPages = async (
	context: { emitFile: (file: { type: 'asset'; fileName: string; source: string }) => string },
	state: PluginState,
	renderFn: typeof renderPageForBuild
): Promise<void> => {
	for (const page of state.pages) {
		if (page.type === 'static') {
			const html = await renderFn(page, state);
			const fileName = page.outputPath?.replace(/^\//, '') || 'index.html';
			context.emitFile({ type: 'asset', fileName, source: html });
		}
	}

	for (const page of state.expandedPages) {
		const html = await renderFn(page, state);
		const fileName = page.outputPath?.replace(/^\//, '') || 'index.html';
		context.emitFile({ type: 'asset', fileName, source: html });
	}
};

const loadBuildManifest = async (
	distDir?: string
): Promise<Record<string, { file: string; css?: string[] }> | undefined> => {
	try {
		const fs = await import('node:fs/promises');
		const path = await import('node:path');
		const manifestPath = path.join(distDir || 'dist', '.vite/manifest.json');
		const manifestContent = await fs.readFile(manifestPath, 'utf-8');
		return JSON.parse(manifestContent);
	} catch {
		return undefined;
	}
};

const updateHtmlWithAssetPaths = async (
	outDir: string,
	manifest: Record<string, { file: string; css?: string[] }>,
	pages: PluginState['pages'],
	expandedPages: PluginState['expandedPages']
): Promise<void> => {
	const fs = await import('node:fs/promises');
	const path = await import('node:path');
	const htmlFiles: string[] = [];

	for (const page of pages) {
		if (page.type === 'static') {
			const fileName = page.outputPath?.replace(/^\//, '') || 'index.html';
			htmlFiles.push(path.join(outDir, fileName));
		}
	}

	for (const page of expandedPages) {
		const fileName = page.outputPath?.replace(/^\//, '') || 'index.html';
		htmlFiles.push(path.join(outDir, fileName));
	}

	for (const htmlFile of htmlFiles) {
		try {
			const html = await fs.readFile(htmlFile, 'utf-8');
			const transformedHtml = transformAssetPaths(html, manifest);
			await fs.writeFile(htmlFile, transformedHtml, 'utf-8');
		} catch {
			continue;
		}
	}
};
