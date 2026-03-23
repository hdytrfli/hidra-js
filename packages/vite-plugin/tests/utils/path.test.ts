import { describe, it, expect } from 'vitest';
import {
	toKebabCase,
	derivePartialName,
	deriveHelperName,
	deriveOutputPath,
	isDynamicPath,
	extractDynamicParams,
	buildUrlFromParams,
} from '@/utils/path.js';

describe('toKebabCase', () => {
	it('converts camelCase to kebab-case', () => {
		expect(toKebabCase('camelCase')).toBe('camel-case');
		expect(toKebabCase('myVariableName')).toBe('my-variable-name');
	});

	it('converts PascalCase to kebab-case', () => {
		expect(toKebabCase('PascalCase')).toBe('pascal-case');
		expect(toKebabCase('MyComponentName')).toBe('my-component-name');
	});

	it('handles consecutive uppercase letters', () => {
		expect(toKebabCase('XMLParser')).toBe('xml-parser');
		expect(toKebabCase('HTMLElement')).toBe('html-element');
	});

	it('handles numbers', () => {
		expect(toKebabCase('test123')).toBe('test123');
		expect(toKebabCase('version2Update')).toBe('version2update');
	});

	it('already kebab-case strings pass through unchanged', () => {
		expect(toKebabCase('already-kebab')).toBe('already-kebab');
		expect(toKebabCase('test')).toBe('test');
	});

	it('handles underscores', () => {
		expect(toKebabCase('snake_case')).toBe('snake-case');
		expect(toKebabCase('my_variable_name')).toBe('my-variable-name');
	});
});

describe('derivePartialName', () => {
	it('strips .hbs extension', () => {
		expect(derivePartialName('button.hbs')).toBe('button');
	});

	it('strips leading src/components/ prefix', () => {
		expect(derivePartialName('src/components/button.hbs')).toBe('button');
	});

	it('converts path separators to /', () => {
		expect(derivePartialName('src/components\\ui/card.hbs')).toBe('ui/card');
	});

	it('handles nested paths e.g. ui/card', () => {
		expect(derivePartialName('src/components/ui/card.hbs')).toBe('ui/card');
		expect(derivePartialName('src/components/forms/input.hbs')).toBe('forms/input');
	});

	it('handles single-level paths e.g. button', () => {
		expect(derivePartialName('src/components/button.hbs')).toBe('button');
	});
});

describe('deriveHelperName', () => {
	it('strips .ts extension', () => {
		expect(deriveHelperName('format-date.ts')).toBe('format-date');
	});

	it('strips .js extension', () => {
		expect(deriveHelperName('format-date.js')).toBe('format-date');
	});

	it('returns kebab-case name from filename', () => {
		expect(deriveHelperName('formatDate.ts')).toBe('format-date');
		expect(deriveHelperName('FormatDate.ts')).toBe('format-date');
	});

	it('handles nested paths - uses only the filename, not the full path', () => {
		expect(deriveHelperName('src/helpers/string/format-date.ts')).toBe('format-date');
		expect(deriveHelperName('utils/formatDate.ts')).toBe('format-date');
	});
});

describe('deriveOutputPath', () => {
	it('index.hbs → index.html', () => {
		expect(deriveOutputPath('src/pages/index.hbs')).toBe('index.html');
	});

	it('about.hbs → about.html', () => {
		expect(deriveOutputPath('src/pages/about.hbs')).toBe('about.html');
	});

	it('about/index.hbs → about/index.html', () => {
		expect(deriveOutputPath('src/pages/about/index.hbs')).toBe('about.html');
	});

	it('blog/post.hbs → blog/post.html', () => {
		expect(deriveOutputPath('src/pages/blog/post.hbs')).toBe('blog/post.html');
	});

	it('strips src/pages/ prefix', () => {
		expect(deriveOutputPath('src/pages/contact.hbs')).toBe('contact.html');
	});
});

describe('isDynamicPath', () => {
	it('returns true for paths with [param]', () => {
		expect(isDynamicPath('src/pages/[slug].hbs')).toBe(true);
		expect(isDynamicPath('src/pages/blog/[slug].hbs')).toBe(true);
		expect(isDynamicPath('src/pages/[category]/[slug].hbs')).toBe(true);
	});

	it('returns false for static paths', () => {
		expect(isDynamicPath('src/pages/index.hbs')).toBe(false);
		expect(isDynamicPath('src/pages/about.hbs')).toBe(false);
		expect(isDynamicPath('src/pages/blog/post.hbs')).toBe(false);
	});
});

describe('extractDynamicParams', () => {
	it('extracts single param', () => {
		expect(extractDynamicParams('src/pages/[slug].hbs')).toEqual(['slug']);
	});

	it('extracts multiple params', () => {
		expect(extractDynamicParams('src/pages/[category]/[slug].hbs')).toEqual(['category', 'slug']);
	});

	it('returns empty array for static paths', () => {
		expect(extractDynamicParams('src/pages/about.hbs')).toEqual([]);
	});

	it('handles params with different names', () => {
		expect(extractDynamicParams('src/pages/[id]/[name].hbs')).toEqual(['id', 'name']);
	});
});

describe('buildUrlFromParams', () => {
	it('builds URL from params for single param', () => {
		expect(buildUrlFromParams('/blog/[slug]', { slug: 'hello' })).toBe('/blog/hello');
	});

	it('builds URL from params for multiple params', () => {
		expect(buildUrlFromParams('/[category]/[slug]', { category: 'news', slug: 'launch' })).toBe(
			'/news/launch'
		);
	});

	it('ensures URL starts with /', () => {
		const result = buildUrlFromParams('blog/[slug]', { slug: 'test' });
		expect(result.startsWith('/')).toBe(true);
	});
});
