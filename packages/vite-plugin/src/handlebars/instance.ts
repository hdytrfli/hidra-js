import Handlebars from 'handlebars';

export type HbsTemplate = Handlebars.TemplateDelegate;

export const createHandlebarsInstance = (): typeof Handlebars => {
	const instance = Handlebars.create();
	return instance;
};

export const setupBaseHelpers = (hbs: typeof Handlebars): void => {
	hbs.registerHelper('yield', function (this: unknown, ...args: unknown[]) {
		const [name, fallback, options] = parseYieldArgs(args);

		if (name === undefined) return options?.fn ? new hbs.SafeString(options.fn(this)) : '';

		const sectionStore = getSectionStore(this);
		const content = sectionStore?.[name as string];

		if (content !== undefined) {
			return new hbs.SafeString(content);
		}

		if (fallback !== undefined) {
			return String(fallback);
		}

		return options?.fn ? new hbs.SafeString(options.fn(this)) : '';
	});

	hbs.registerHelper(
		'section',
		function (this: unknown, name: string, options: Handlebars.HelperOptions) {
			const sectionStore = getSectionStore(this);
			if (sectionStore) {
				sectionStore[name] = options.fn(this);
			}
			return '';
		}
	);
};

type ParsedYieldArgs = [
	name: unknown,
	fallback: unknown,
	options: Handlebars.HelperOptions | undefined,
];

const parseYieldArgs = (args: unknown[]): ParsedYieldArgs => {
	const [name, fallback, options] = args;

	const validate = (value: unknown): value is Handlebars.HelperOptions => {
		return typeof value === 'object' && value !== null && 'fn' in value;
	};

	if (validate(fallback)) return [name, undefined, fallback];
	return [name, fallback, options as Handlebars.HelperOptions | undefined];
};

const getSectionStore = (context: unknown): Record<string, string> | undefined => {
	if (typeof context === 'object' && context !== null && '_sections' in context) {
		return (context as Record<string, unknown>)._sections as Record<string, string>;
	}
	return undefined;
};
