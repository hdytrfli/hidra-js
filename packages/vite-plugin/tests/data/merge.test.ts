import { describe, it, expect } from 'vitest';
import { mergeContext } from '@/data/merge.js';

describe('mergeContext', () => {
	it('global data appears in the merged context', () => {
		const globalData = { site: 'Test', year: 2026 };
		const pageProps = { title: 'Home' };
		const pageMeta = {
			url: '/',
			path: 'src/pages/index.hbs',
			params: {},
			props: {},
			type: 'static' as const,
		};

		const result = mergeContext(globalData, pageProps, pageMeta);

		expect(result.site).toBe('Test');
		expect(result.year).toBe(2026);
	});

	it('page props appear under page.props in the merged context', () => {
		const globalData = { site: 'Test' };
		const pageProps = { title: 'Home', description: 'Welcome' };
		const pageMeta = {
			url: '/',
			path: 'src/pages/index.hbs',
			params: {},
			props: {},
			type: 'static' as const,
		};

		const result = mergeContext(globalData, pageProps, pageMeta);

		expect(result.page?.props).toEqual({ title: 'Home', description: 'Welcome' });
	});

	it('PageMeta fields appear under page.*', () => {
		const globalData = { site: 'Test' };
		const pageProps = {};
		const pageMeta = {
			url: '/about',
			path: 'src/pages/about.hbs',
			params: {},
			props: {},
			type: 'static' as const,
		};

		const result = mergeContext(globalData, pageProps, pageMeta);

		expect(result.page?.url).toBe('/about');
		expect(result.page?.path).toBe('src/pages/about.hbs');
		expect(result.page?.type).toBe('static');
	});

	it('global data key conflicting with page is overridden by the page object', () => {
		const globalData = { page: { url: '/old' } };
		const pageProps = {};
		const pageMeta = {
			url: '/new',
			path: 'src/pages/index.hbs',
			params: {},
			props: {},
			type: 'static' as const,
		};

		const result = mergeContext(globalData, pageProps, pageMeta);

		expect(result.page?.url).toBe('/new');
	});

	it('deep merge: nested objects from global are merged with nested objects from page props', () => {
		const globalData = { config: { theme: 'dark', lang: 'en' } };
		const pageProps = { config: { layout: 'sidebar' } };
		const pageMeta = {
			url: '/',
			path: 'src/pages/index.hbs',
			params: {},
			props: {},
			type: 'static' as const,
		};

		const result = mergeContext(globalData, pageProps, pageMeta);

		expect(result.page?.props).toEqual({ config: { layout: 'sidebar' } });
		expect(result.config).toEqual({ theme: 'dark', lang: 'en' });
	});
});

describe('context shape', () => {
	it('final context contains all global keys at root level', () => {
		const globalData = { site: 'Test', year: 2026, author: 'Dev' };
		const pageProps = {};
		const pageMeta = {
			url: '/',
			path: 'src/pages/index.hbs',
			params: {},
			props: {},
			type: 'static' as const,
		};

		const result = mergeContext(globalData, pageProps, pageMeta);

		expect(result.site).toBe('Test');
		expect(result.year).toBe(2026);
		expect(result.author).toBe('Dev');
	});

	it('final context contains page.url', () => {
		const globalData = {};
		const pageProps = {};
		const pageMeta = {
			url: '/blog/post',
			path: 'src/pages/blog/post.hbs',
			params: {},
			props: {},
			type: 'static' as const,
		};

		const result = mergeContext(globalData, pageProps, pageMeta);

		expect(result.page?.url).toBe('/blog/post');
	});

	it('final context contains page.path', () => {
		const globalData = {};
		const pageProps = {};
		const pageMeta = {
			url: '/',
			path: 'src/pages/blog/post.hbs',
			params: {},
			props: {},
			type: 'static' as const,
		};

		const result = mergeContext(globalData, pageProps, pageMeta);

		expect(result.page?.path).toBe('src/pages/blog/post.hbs');
	});

	it('final context contains page.params', () => {
		const globalData = {};
		const pageProps = {};
		const pageMeta = {
			url: '/blog/hello',
			path: 'src/pages/blog/[slug].hbs',
			params: { slug: 'hello' },
			props: {},
			type: 'dynamic' as const,
		};

		const result = mergeContext(globalData, pageProps, pageMeta);

		expect(result.page?.params).toEqual({ slug: 'hello' });
	});

	it('final context contains page.props', () => {
		const globalData = {};
		const pageProps = { title: 'Post', content: 'Hello' };
		const pageMeta = {
			url: '/blog/hello',
			path: 'src/pages/blog/[slug].hbs',
			params: {},
			props: {},
			type: 'dynamic' as const,
		};

		const result = mergeContext(globalData, pageProps, pageMeta);

		expect(result.page?.props).toEqual({ title: 'Post', content: 'Hello' });
	});

	it('final context contains page.type', () => {
		const globalData = {};
		const pageProps = {};
		const pageMeta = {
			url: '/',
			path: 'src/pages/index.hbs',
			params: {},
			props: {},
			type: 'static' as const,
		};

		const result = mergeContext(globalData, pageProps, pageMeta);

		expect(result.page?.type).toBe('static');
	});
});
