import type { PluginState } from '@/core/state/generator';
import { createHandlebarsInstance, setupBaseHelpers } from '@/handlebars/instance';
import { setupSectionHelpers } from '@/handlebars/section';
import { setupLayoutHelper, clearLayoutCache } from '@/handlebars/layout';
import { registerComponents } from '@/handlebars/component';
import { registerHelpers, setDevServer } from '@/handlebars/helper';
import { setHandlebarsInstance } from '@/core/state/generator';

export { clearLayoutCache };

/**
 * Sets up Handlebars instance with all helpers and components.
 * Called once during plugin initialization.
 */
export const setupHandlebars = async (state: PluginState): Promise<void> => {
	if (state.handlebarsInstance) return;
	const hbs = createHandlebarsInstance();

	setupBaseHelpers(hbs);
	setupSectionHelpers(hbs);
	setupLayoutHelper(hbs, state.config);

	await registerComponents(hbs, state.config);
	await registerHelpers(hbs, state.config, state.viteServer ?? undefined);

	setHandlebarsInstance(state, hbs);
};

/**
 * Resets and reinitializes Handlebars for dev mode HMR.
 * Clears cache and re-registers helpers with fresh modules.
 */
export const setupHandlebarsForDev = async (state: PluginState): Promise<void> => {
	if (state.viteServer) setDevServer(state.viteServer);
	state.handlebarsInstance = null;
	await setupHandlebars(state);
};

/**
 * Sets up Handlebars for production build.
 * No HMR support, optimized for one-time rendering.
 */
export const setupHandlebarsForBuild = async (state: PluginState): Promise<void> => {
	const hbs = createHandlebarsInstance();

	setupBaseHelpers(hbs);
	setupSectionHelpers(hbs);
	setupLayoutHelper(hbs, state.config);

	await registerComponents(hbs, state.config);
	await registerHelpers(hbs, state.config);

	setHandlebarsInstance(state, hbs);
};
