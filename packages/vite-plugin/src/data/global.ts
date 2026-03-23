import type { ViteDevServer, ResolvedConfig as ViteResolvedConfig } from 'vite';
import { createJiti } from 'jiti';
import { resolve } from 'pathe';
import { fileExists } from '@/utils/fs.js';

export const loadGlobalData = async (
	globalPath: string,
	timestamp: number,
	server: ViteDevServer | undefined,
	viteConfig: ViteResolvedConfig | undefined
): Promise<Record<string, unknown>> => {
	const root = viteConfig?.root || process.cwd();
	const resolvedPath = resolve(root, globalPath);

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
			if (typeof fn === 'function') data = await fn();
			else data = fn;
		} else {
			const alias: Record<string, string> = {};

			if (viteConfig?.resolve?.alias) {
				const check = Array.isArray(viteConfig.resolve.alias);
				const aliases = check ? viteConfig.resolve.alias : [viteConfig.resolve.alias];

				for (const item of aliases) {
					if (typeof item === 'object' && 'find' in item && 'replacement' in item) {
						alias[item.find as string] = resolve(root, item.replacement as string);
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
			if (typeof fn === 'function') data = await fn();
			else data = fn;
		}

		if (typeof data !== 'object' || data === null) return {};
		return data as Record<string, unknown>;
	} catch {
		return {};
	}
};
