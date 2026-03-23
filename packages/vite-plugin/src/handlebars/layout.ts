import { readFileSync } from 'node:fs';

import type Handlebars from 'handlebars';

import type { ResolvedConfig } from '@/types/config.js';
import { HidraError } from '@/utils/error.js';
import { ERRORS } from '@/utils/errors.js';

const MAX_LAYOUT_DEPTH = 5;

interface LayoutCache {
	get: (name: string) => string | undefined;
	set: (name: string, source: string) => void;
	has: (name: string) => boolean;
	delete: (name: string) => boolean;
}

const createLayoutCache = (): LayoutCache => {
	const cache = new Map<string, string>();
	return {
		get: (name: string) => cache.get(name),
		set: (name: string, source: string) => cache.set(name, source),
		has: (name: string) => cache.has(name),
		delete: (name: string) => cache.delete(name),
	};
};

let layoutCache: LayoutCache | null = null;

const getLayoutCache = (): LayoutCache => {
	if (!layoutCache) {
		layoutCache = createLayoutCache();
	}
	return layoutCache;
};

export const clearLayoutCache = (): void => {
	layoutCache = null;
};

export const setupLayoutHelper = (hbs: typeof Handlebars, config: ResolvedConfig): void => {
	hbs.registerHelper(
		'layout',
		function (this: unknown, name: string, options: Handlebars.HelperOptions) {
			const rootContext = options.data.root as Record<string, unknown>;
			const layoutChain = (rootContext._layoutChain as string[]) || [];

			if (layoutChain.includes(name)) {
				throw new HidraError(ERRORS.CIRCULAR_LAYOUT, {
					chain: layoutChain.join(' -> ') + ' -> ' + name,
				});
			}

			if (layoutChain.length >= MAX_LAYOUT_DEPTH) {
				throw new HidraError(ERRORS.MAX_LAYOUT_DEPTH, {
					depth: String(layoutChain.length),
					max: String(MAX_LAYOUT_DEPTH),
				});
			}

			const innerContent = options.fn(rootContext);

			return renderLayoutChain(
				hbs,
				config.layouts.dir,
				name,
				{ ...rootContext, _layoutChain: [...layoutChain, name] },
				innerContent
			);
		}
	);
};

const renderLayoutChain = (
	hbs: typeof Handlebars,
	layoutsDir: string,
	layoutName: string,
	context: Record<string, unknown>,
	innerContent: string
): string => {
	const cache = getLayoutCache();
	const cacheKey = layoutsDir + '/' + layoutName;

	let layoutSource = cache.get(cacheKey);

	if (layoutSource === undefined) {
		const layoutPath = layoutsDir + '/' + layoutName + '.hbs';
		try {
			layoutSource = readTextFileSync(layoutPath);
			cache.set(cacheKey, layoutSource);
		} catch {
			throw new HidraError(ERRORS.LAYOUT_NOT_FOUND, {
				path: layoutPath,
			});
		}
	}

	const template = hbs.compile(layoutSource);

	const sectionContext = {
		...context,
		_content: innerContent,
		_sections: context._sections || {},
	};

	const result = template(sectionContext);

	const nextLayoutMatch = result.match(/{{\s*#layout\s+"([^"]+)"\s*}}([\s\S]*?){{\s*\/layout\s*}}/);
	if (nextLayoutMatch) {
		const nextLayoutName = nextLayoutMatch[1];
		const nextInnerContent = nextLayoutMatch[2];
		if (!nextLayoutName || !nextInnerContent) {
			return result;
		}
		return renderLayoutChain(hbs, layoutsDir, nextLayoutName, context, nextInnerContent);
	}

	return result.replace(/{{\s*_content\s*}}/g, innerContent);
};

const readTextFileSync = (filePath: string): string => {
	return readFileSync(filePath, 'utf-8');
};
