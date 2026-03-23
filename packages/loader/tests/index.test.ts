import { describe, it, expect } from 'vitest';
import { root, loader, dynamic } from '../src/index.js';
import type { PageMeta } from '../src/index.js';

describe('root()', () => {
	it('returns the same function it receives', () => {
		const fn = async () => ({ data: 'test' });
		const wrapped = root(fn);
		expect(wrapped).toBe(fn);
	});

	it('returned function when called returns the same value as the original', async () => {
		const fn = async () => ({ data: 'test' });
		const wrapped = root(fn);
		const result = await wrapped();
		expect(result).toEqual({ data: 'test' });
	});

	it('returned function is async', () => {
		const fn = async () => ({});
		const wrapped = root(fn);
		expect(wrapped()).toBeInstanceOf(Promise);
	});

	it('works with an empty object return', async () => {
		const fn = async () => ({});
		const wrapped = root(fn);
		const result = await wrapped();
		expect(result).toEqual({});
	});

	it('works with a nested object return', async () => {
		const fn = async () => ({ user: { name: 'test', settings: { theme: 'dark' } } });
		const wrapped = root(fn);
		const result = await wrapped();
		expect(result).toEqual({ user: { name: 'test', settings: { theme: 'dark' } } });
	});
});

describe('loader()', () => {
	it('returns the same function it receives', () => {
		const fn = async () => ({ data: 'test' });
		const wrapped = loader(fn);
		expect(wrapped).toBe(fn);
	});

	it('returned function receives a page argument', async () => {
		let receivedPage: { page: PageMeta } | undefined;
		const fn = async (ctx: { page: PageMeta }) => {
			receivedPage = ctx;
			return { data: 'test' };
		};
		const wrapped = loader(fn);
		const mockPage: PageMeta = {
			url: '/test',
			path: 'src/pages/test.hbs',
			params: {},
			props: {},
			type: 'static',
		};
		await wrapped({ page: mockPage });
		expect(receivedPage).toEqual({ page: mockPage });
	});

	it('returned function when called with a mock PageMeta returns the expected value', async () => {
		const fn = async ({ page }: { page: PageMeta }) => ({ url: page.url });
		const wrapped = loader(fn);
		const mockPage: PageMeta = {
			url: '/about',
			path: 'src/pages/about.hbs',
			params: {},
			props: {},
			type: 'static',
		};
		const result = await wrapped({ page: mockPage });
		expect(result).toEqual({ url: '/about' });
	});

	it('works with an empty object return', async () => {
		const fn = async () => ({});
		const wrapped = loader(fn);
		const mockPage: PageMeta = {
			url: '/test',
			path: 'src/pages/test.hbs',
			params: {},
			props: {},
			type: 'static',
		};
		const result = await wrapped({ page: mockPage });
		expect(result).toEqual({});
	});

	it('works when accessing page.url, page.params, page.props, page.type', async () => {
		const fn = async ({ page }: { page: PageMeta }) => ({
			url: page.url,
			params: page.params,
			props: page.props,
			type: page.type,
		});
		const wrapped = loader(fn);
		const mockPage: PageMeta = {
			url: '/blog/hello',
			path: 'src/pages/blog/[slug].hbs',
			params: { slug: 'hello' },
			props: { title: 'Hello' },
			type: 'dynamic',
		};
		const result = await wrapped({ page: mockPage });
		expect(result).toEqual({
			url: '/blog/hello',
			params: { slug: 'hello' },
			props: { title: 'Hello' },
			type: 'dynamic',
		});
	});
});

describe('dynamic()', () => {
	it('returns the same function it receives', () => {
		const fn = async () => [];
		const wrapped = dynamic(fn);
		expect(wrapped).toBe(fn);
	});

	it('returned function when called returns an array', async () => {
		const fn = async () => [{ params: { slug: 'test' }, props: {} }];
		const wrapped = dynamic(fn);
		const result = await wrapped();
		expect(Array.isArray(result)).toBe(true);
	});

	it('each array entry has params and props', async () => {
		const fn = async () => [
			{ params: { slug: 'hello' }, props: { title: 'Hello' } },
			{ params: { slug: 'world' }, props: { title: 'World' } },
		];
		const wrapped = dynamic(fn);
		const result = await wrapped();
		expect(result).toEqual([
			{ params: { slug: 'hello' }, props: { title: 'Hello' } },
			{ params: { slug: 'world' }, props: { title: 'World' } },
		]);
	});

	it('works with an empty array return', async () => {
		const fn = async () => [];
		const wrapped = dynamic(fn);
		const result = await wrapped();
		expect(result).toEqual([]);
	});

	it('works with a single entry', async () => {
		const fn = async () => [{ params: { id: '1' }, props: { name: 'Test' } }];
		const wrapped = dynamic(fn);
		const result = await wrapped();
		expect(result).toEqual([{ params: { id: '1' }, props: { name: 'Test' } }]);
	});

	it('works with multiple entries', async () => {
		const fn = async () => [
			{ params: { id: '1' }, props: { name: 'First' } },
			{ params: { id: '2' }, props: { name: 'Second' } },
			{ params: { id: '3' }, props: { name: 'Third' } },
		];
		const wrapped = dynamic(fn);
		const result = await wrapped();
		expect(result).toHaveLength(3);
	});
});
