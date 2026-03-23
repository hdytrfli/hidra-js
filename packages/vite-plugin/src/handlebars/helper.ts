import type { ResolvedConfig } from '@/types/config.js';
import type Handlebars from 'handlebars';
import type { ViteDevServer } from 'vite';
import { glob, isExcludedFile } from '@/utils/fs.js';
import { deriveHelperName } from '@/utils/path.js';
import { createJiti } from 'jiti';
import { resolve } from 'pathe';

const registeredHelpers = new Map<string, string>();
let devServer: ViteDevServer | undefined;

export const setDevServer = (server: ViteDevServer): void => {
	devServer = server;
};

/**
 * Registers all helper modules from the helpers directory.
 * Supports both default and named exports.
 */
export const registerHelpers = async (
	hbs: typeof Handlebars,
	config: ResolvedConfig,
	server?: ViteDevServer
): Promise<void> => {
	const files = await glob('**/*.{ts,js}', { cwd: config.helpers.dir });
	const helperFiles = files.filter((file) => !isExcludedFile(file));

	for (const file of helperFiles) {
		const fullPath = resolve(config.helpers.dir + '/' + file);
		await registerHelperModule(hbs, fullPath, file, server || devServer);
	}
};

const registerHelperModule = async (
	hbs: typeof Handlebars,
	fullPath: string,
	file: string,
	server?: ViteDevServer
): Promise<void> => {
	const mod = await loadHelperModule(fullPath, server);
	const name = deriveHelperName(file);

	if ('default' in mod && typeof mod.default === 'function') {
		hbs.registerHelper(name, mod.default as Handlebars.HelperDelegate);
		registeredHelpers.set(name, fullPath);
		return;
	}

	for (const [exportName, fn] of Object.entries(mod)) {
		if (typeof fn === 'function') {
			const helperName = exportName === 'default' ? name : deriveHelperName(exportName);
			hbs.registerHelper(helperName, fn as Handlebars.HelperDelegate);
			registeredHelpers.set(helperName, fullPath);
		}
	}
};

const loadHelperModule = async (
	fullPath: string,
	server?: ViteDevServer
): Promise<Record<string, unknown>> => {
	if (server) {
		return await server.ssrLoadModule(fullPath);
	}

	const jiti = createJiti(import.meta.url, { cache: false });
	return jiti(fullPath) as Record<string, unknown>;
};

/**
 * Clears all registered helpers for hot reload.
 */
export const clearRegisteredHelpers = (hbs: typeof Handlebars): void => {
	for (const name of registeredHelpers.keys()) {
		hbs.unregisterHelper(name);
	}
	registeredHelpers.clear();
};

export const registerHelper = (
	hbs: typeof Handlebars,
	name: string,
	fn: Handlebars.HelperDelegate
): void => {
	hbs.registerHelper(name, fn);
	registeredHelpers.set(name, 'inline');
};
