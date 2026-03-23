import type Handlebars from 'handlebars';

interface SectionStore {
	[name: string]: string;
}

export const setupSectionHelpers = (hbs: typeof Handlebars): void => {
	hbs.registerHelper(
		'section',
		function (this: unknown, name: string, options: Handlebars.HelperOptions) {
			const rootContext = options.data.root as Record<string, unknown>;
			let store = rootContext._sections as SectionStore | undefined;

			if (!store) {
				store = {};
				rootContext._sections = store;
			}

			store[name] = options.fn(rootContext);
			return '';
		}
	);

	hbs.registerHelper('yield', function (this: unknown, ...args: unknown[]) {
		const options = args[args.length - 1] as Handlebars.HelperOptions;
		const rootContext = options.data.root as Record<string, unknown>;
		const store = rootContext._sections as SectionStore | undefined;

		const name = args[0] as string | undefined;
		const fallbackOrOptions = args[1];

		let fallback: unknown;
		let helperOptions: Handlebars.HelperOptions | undefined;

		if (
			typeof fallbackOrOptions === 'object' &&
			fallbackOrOptions !== null &&
			'fn' in fallbackOrOptions
		) {
			fallback = undefined;
			helperOptions = fallbackOrOptions as Handlebars.HelperOptions;
		} else {
			fallback = fallbackOrOptions;
			helperOptions = options;
		}

		if (name === undefined) {
			const content = rootContext._content as string | undefined;
			if (content !== undefined && content !== '') {
				return new hbs.SafeString(content);
			}
			if (helperOptions && helperOptions.fn) {
				const result = helperOptions.fn(rootContext);
				if (typeof result === 'string') {
					return new hbs.SafeString(result);
				}
			}
			return '';
		}

		const content = store ? store[name] : undefined;

		if (content !== undefined) {
			return new hbs.SafeString(content);
		}

		if (fallback !== undefined && typeof fallback !== 'object') {
			return String(fallback);
		}

		if (helperOptions && helperOptions.fn) {
			const result = helperOptions.fn(rootContext);
			if (typeof result === 'string') {
				return new hbs.SafeString(result);
			}
		}

		return '';
	});
};
