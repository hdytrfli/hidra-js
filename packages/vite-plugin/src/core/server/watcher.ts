import type { ViteDevServer } from 'vite';
import type { PluginState } from '@/core/state/generator';
import type { PluginHelpers } from '@/core/plugin/helpers';
import { clearLayoutCache } from '@/handlebars/layout';
import { setupHandlebarsForDev } from '@/core/state/handlebars';
import { endWithArray } from '@/core/server/helper';

interface HmrWatcherOptions {
	state: PluginState;
	helpers: PluginHelpers;
}

/**
 * Sets up file watchers for HMR in dev server.
 * Watches for page additions, removals, and changes.
 */
export const setupHmrWatcher = (options: HmrWatcherOptions, server: ViteDevServer): void => {
	const { state, helpers } = options;

	server.watcher.on('add', async (file) => {
		if (file.includes('/pages/') && file.endsWith('.hbs')) {
			state.reloadTimestamp = Date.now();
			await helpers.rediscoverPages(server);
			server.ws.send({ type: 'full-reload', path: '*' });
		}
	});

	server.watcher.on('unlink', async (file) => {
		if (file.includes('/pages/') && file.endsWith('.hbs')) {
			state.reloadTimestamp = Date.now();
			await helpers.rediscoverPages(server);
			server.ws.send({ type: 'full-reload', path: '*' });
		}
	});

	server.watcher.on('change', async (file) => {
		const watched = endWithArray(file, ['.hbs', '.data.ts', 'global.ts', '.css', '.ts', '.js']);
		if (!watched) return;

		state.reloadTimestamp = Date.now();
		if (file.endsWith('.hbs')) clearLayoutCache();

		const page = file.includes('/pages/') && file.endsWith('.hbs');
		if (page) await helpers.rediscoverPages(server);

		if (file.includes('/helpers/') && state.viteServer) {
			for (const mod of state.viteServer.moduleGraph.idToModuleMap.values()) {
				if (mod.id && mod.id.includes('/helpers/')) {
					state.viteServer.moduleGraph.invalidateModule(mod);
				}
			}
		}

		const component = file.includes('/components/') && file.endsWith('.hbs');
		if (component || file.includes('/helpers/')) await setupHandlebarsForDev(state);

		const javascript = endWithArray(file, ['.data.ts', '.js', '.ts']);
		if (javascript) await helpers.reexpandAffectedDynamicPages(file, server);

		server.ws.send({
			type: 'full-reload',
			path: '*',
		});
	});
};

/**
 * Handles hot module updates for changed files.
 * Invalidates modules and triggers reloads as needed.
 */
export const handleHotUpdate = async (
	file: string,
	server: ViteDevServer,
	options: HmrWatcherOptions
): Promise<void> => {
	const { state, helpers } = options;

	const watched = endWithArray(file, ['.hbs', '.data.ts', 'global.ts', '.css', '.ts', '.js']);
	if (!watched) return;

	state.reloadTimestamp = Date.now();
	if (file.endsWith('.hbs')) clearLayoutCache();

	const page = file.includes('/pages/') && file.endsWith('.hbs');
	if (page) await helpers.rediscoverPages(server);

	if (file.includes('/helpers/')) {
		for (const mod of server.moduleGraph.idToModuleMap.values()) {
			if (mod.id && mod.id.includes('/helpers/')) {
				server.moduleGraph.invalidateModule(mod);
			}
		}

		await setupHandlebarsForDev(state);
	}

	const component = file.includes('/components/') && file.endsWith('.hbs');
	if (component) await setupHandlebarsForDev(state);

	const javascript = endWithArray(file, ['.data.ts', '.js', '.ts']);
	if (javascript) await helpers.reexpandAffectedDynamicPages(file, server);

	server.ws.send({
		type: 'full-reload',
		path: '*',
	});
};
