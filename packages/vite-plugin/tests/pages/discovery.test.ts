import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { discoverPages } from '@/pages/discovery.js';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join, normalize } from 'node:path';
import { HidraError } from '@/utils/error.js';
import { ERRORS } from '@/utils/errors.js';

describe('discoverPages', () => {
	let tempDir: string;

	beforeEach(async () => {
		tempDir = await mkdtempSafe();
	});

	afterEach(async () => {
		await rm(tempDir, { recursive: true, force: true });
	});

	it('index.hbs is discovered as a page', async () => {
		await writeFile(join(tempDir, 'index.hbs'), '<h1>Home</h1>');
		const pages = await discoverPages(tempDir);

		expect(pages).toHaveLength(1);
		expect(pages[0]?.path).toBe(tempDir + '/index.hbs');
		expect(pages[0]?.type).toBe('static');
	});

	it('about.hbs is discovered as a page', async () => {
		await writeFile(join(tempDir, 'about.hbs'), '<h1>About</h1>');
		const pages = await discoverPages(tempDir);

		expect(pages).toHaveLength(1);
		expect(pages[0]?.path).toBe(tempDir + '/about.hbs');
	});

	it('about/index.hbs is discovered as a page', async () => {
		const aboutDir = join(tempDir, 'about');
		await mkdir(aboutDir, { recursive: true });
		await writeFile(join(aboutDir, 'index.hbs'), '<h1>About</h1>');
		const pages = await discoverPages(tempDir);

		expect(pages).toHaveLength(1);
		expect(normalize(pages[0]?.path || '')).toBe(normalize(aboutDir + '/index.hbs'));
	});

	it('blog/post.hbs is discovered as a page', async () => {
		const blogDir = join(tempDir, 'blog');
		await mkdir(blogDir, { recursive: true });
		await writeFile(join(blogDir, 'post.hbs'), '<h1>Post</h1>');
		const pages = await discoverPages(tempDir);

		expect(pages).toHaveLength(1);
		expect(normalize(pages[0]?.path || '')).toBe(normalize(blogDir + '/post.hbs'));
	});

	it('files prefixed with _ are excluded', async () => {
		await writeFile(join(tempDir, '_partial.hbs'), '<div>Partial</div>');
		await writeFile(join(tempDir, 'index.hbs'), '<h1>Home</h1>');
		const pages = await discoverPages(tempDir);

		expect(pages).toHaveLength(1);
		expect(pages[0]?.path).toBe(tempDir + '/index.hbs');
	});

	it('non-.hbs files are excluded', async () => {
		await writeFile(join(tempDir, 'readme.md'), '# Readme');
		await writeFile(join(tempDir, 'index.hbs'), '<h1>Home</h1>');
		const pages = await discoverPages(tempDir);

		expect(pages).toHaveLength(1);
	});

	it('.gitkeep files are excluded', async () => {
		await writeFile(join(tempDir, '.gitkeep'), '');
		const pages = await discoverPages(tempDir);

		expect(pages).toHaveLength(0);
	});

	it('[slug].hbs is discovered as a dynamic page', async () => {
		const blogDir = join(tempDir, 'blog');
		await mkdir(blogDir, { recursive: true });
		await writeFile(join(blogDir, '[slug].hbs'), '<h1>Post</h1>');
		const pages = await discoverPages(tempDir);

		expect(pages).toHaveLength(1);
		expect(pages[0]?.type).toBe('dynamic');
		expect(pages[0]?.params).toEqual({ slug: '' });
	});
});

describe('output path mapping', () => {
	let tempDir: string;

	beforeEach(async () => {
		tempDir = await mkdtempSafe();
	});

	afterEach(async () => {
		await rm(tempDir, { recursive: true, force: true });
	});

	it('index.hbs → index.html', async () => {
		await writeFile(join(tempDir, 'index.hbs'), '<h1>Home</h1>');
		const pages = await discoverPages(tempDir);
		expect(pages[0]?.outputPath).toBe('index.html');
	});

	it('about.hbs → about.html', async () => {
		await writeFile(join(tempDir, 'about.hbs'), '<h1>About</h1>');
		const pages = await discoverPages(tempDir);
		expect(pages[0]?.outputPath).toBe('about.html');
	});

	it('about/index.hbs → about.html', async () => {
		const aboutDir = join(tempDir, 'about');
		await mkdir(aboutDir, { recursive: true });
		await writeFile(join(aboutDir, 'index.hbs'), '<h1>About</h1>');
		const pages = await discoverPages(tempDir);
		expect(pages[0]?.outputPath).toBe('about.html');
	});
});

describe('conflict detection', () => {
	let tempDir: string;

	beforeEach(async () => {
		tempDir = await mkdtempSafe();
	});

	afterEach(async () => {
		await rm(tempDir, { recursive: true, force: true });
	});

	it('about.hbs and about/index.hbs coexisting throws HidraError', async () => {
		await writeFile(join(tempDir, 'about.hbs'), '<h1>About</h1>');
		const aboutDir = join(tempDir, 'about');
		await mkdir(aboutDir, { recursive: true });
		await writeFile(join(aboutDir, 'index.hbs'), '<h1>About Index</h1>');

		try {
			await discoverPages(tempDir);
			expect.fail('Expected HidraError to be thrown');
		} catch (error) {
			expect(error).toBeInstanceOf(HidraError);
			expect((error as HidraError).code).toBe(ERRORS.PAGE_CONFLICT.code);
		}
	});

	it('conflict error includes both conflicting file paths', async () => {
		await writeFile(join(tempDir, 'about.hbs'), '<h1>About</h1>');
		const aboutDir = join(tempDir, 'about');
		await mkdir(aboutDir, { recursive: true });
		await writeFile(join(aboutDir, 'index.hbs'), '<h1>About Index</h1>');

		try {
			await discoverPages(tempDir);
		} catch (error) {
			if (error instanceof HidraError) {
				expect(error.code).toBe(ERRORS.PAGE_CONFLICT.code);
				expect(error.context.path1).toBeDefined();
				expect(error.context.path2).toBeDefined();
			}
		}
	});
});

describe('static vs dynamic classification', () => {
	let tempDir: string;

	beforeEach(async () => {
		tempDir = await mkdtempSafe();
	});

	afterEach(async () => {
		await rm(tempDir, { recursive: true, force: true });
	});

	it('pages without [param] segments are classified as static', async () => {
		await writeFile(join(tempDir, 'index.hbs'), '<h1>Home</h1>');
		await writeFile(join(tempDir, 'about.hbs'), '<h1>About</h1>');
		const pages = await discoverPages(tempDir);

		pages.forEach((page) => {
			expect(page.type).toBe('static');
		});
	});

	it('pages with [param] segments are classified as dynamic', async () => {
		const blogDir = join(tempDir, 'blog');
		await mkdir(blogDir, { recursive: true });
		await writeFile(join(blogDir, '[slug].hbs'), '<h1>Post</h1>');
		const pages = await discoverPages(tempDir);

		expect(pages[0]?.type).toBe('dynamic');
	});

	it('multiple [param] segments in one path are classified as dynamic', async () => {
		const blogDir = join(tempDir, 'blog');
		const categoryDir = join(blogDir, '[category]');
		await mkdir(blogDir, { recursive: true });
		await mkdir(categoryDir, { recursive: true });
		await writeFile(join(categoryDir, '[slug].hbs'), '<h1>Post</h1>');
		const pages = await discoverPages(tempDir);

		expect(pages[0]?.type).toBe('dynamic');
		expect(pages[0]?.params).toEqual({ category: '', slug: '' });
	});
});

const mkdtempSafe = async (): Promise<string> => {
	const fs = await import('node:fs/promises');
	const os = await import('node:os');
	const path = await import('node:path');
	return await fs.mkdtemp(path.join(os.tmpdir(), 'hidra-test-'));
};
