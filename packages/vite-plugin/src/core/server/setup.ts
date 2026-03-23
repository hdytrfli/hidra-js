import type { PluginState } from '../state/generator.js';
import type { ViteDevServer } from 'vite';
import { setViteServer } from '../state/generator.js';

/**
 * Sets up the dev server URL handler and stores server reference.
 * Called during configureServer hook initialization.
 */
export const setupDevServerUrl = (state: PluginState, server: ViteDevServer): void => {
	setViteServer(state, server);
};
