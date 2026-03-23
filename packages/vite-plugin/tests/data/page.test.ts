import { writeFile, rm } from 'node:fs/promises';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadPageData } from '@/data/page.js';

describe('loadPageData', () => {
	let tempDir: string;

	beforeEach(async () => {
		tempDir = await mkdtempSafe();
	});

	afterEach(async () => {
		await rm(tempDir, { recursive: true, force: true });
	});

	it('loader() export is called with page metadata', async () => {
		const pageContent = `
			export default async function loader({ page }) {
				return { url: page.url };
			}
		`;
		const pagePath = tempDir + '/index.hbs';
		await writeFile(tempDir + '/index.data.ts', pageContent);

		const data = await loadPageData(
			pagePath,
			{ id: 'index', path: pagePath, outputPath: 'index.html', type: 'static' },
			undefined,
			undefined
		);

		expect(data).toEqual({ url: '/index.html' });
	});

	it('return value becomes page.props in the template context', async () => {
		const pageContent = `
			export default async function loader() {
				return { title: 'Test Page', description: 'A test' };
			}
		`;
		await writeFile(tempDir + '/index.data.ts', pageContent);

		const data = await loadPageData(
			tempDir + '/index.hbs',
			{ id: 'index', path: tempDir + '/index.hbs', outputPath: 'index.html', type: 'static' },
			undefined,
			undefined
		);

		expect(data).toEqual({ title: 'Test Page', description: 'A test' });
	});

	it('async loader() is awaited correctly', async () => {
		const pageContent = `
			export default async function loader() {
				await new Promise(resolve => setTimeout(resolve, 10));
				return { loaded: true };
			}
		`;
		await writeFile(tempDir + '/index.data.ts', pageContent);

		const data = await loadPageData(
			tempDir + '/index.hbs',
			{ id: 'index', path: tempDir + '/index.hbs', outputPath: 'index.html', type: 'static' },
			undefined,
			undefined
		);

		expect(data).toEqual({ loaded: true });
	});

	it('page argument contains correct url, path, params, type', async () => {
		const pageContent = `
			export default async function loader({ page }) {
				return {
					url: page.url,
					path: page.path,
					type: page.type,
				};
			}
		`;
		await writeFile(tempDir + '/about.data.ts', pageContent);

		const data = await loadPageData(
			tempDir + '/about.hbs',
			{ id: 'about', path: tempDir + '/about.hbs', outputPath: 'about.html', type: 'static' },
			undefined,
			undefined
		);

		expect(data.url).toBe('/about.html');
		expect(data.type).toBe('static');
	});

	it('loader() throwing returns empty object', async () => {
		const pageContent = `
			export default async function loader() {
				throw new Error('Test error');
			}
		`;
		await writeFile(tempDir + '/index.data.ts', pageContent);

		const data = await loadPageData(
			tempDir + '/index.hbs',
			{ id: 'index', path: tempDir + '/index.hbs', outputPath: 'index.html', type: 'static' },
			undefined,
			undefined
		);

		expect(data).toEqual({});
	});
});

describe('missing data file', () => {
	let tempDir: string;

	beforeEach(async () => {
		tempDir = await mkdtempSafe();
	});

	afterEach(async () => {
		await rm(tempDir, { recursive: true, force: true });
	});

	it('a page without a .data.ts file gets page.props as {}', async () => {
		const data = await loadPageData(
			tempDir + '/index.hbs',
			{ id: 'index', path: tempDir + '/index.hbs', outputPath: 'index.html', type: 'static' },
			undefined,
			undefined
		);

		expect(data).toEqual({});
	});

	it('no error is thrown for missing .data.ts on static pages', async () => {
		await expect(
			loadPageData(
				tempDir + '/index.hbs',
				{ id: 'index', path: tempDir + '/index.hbs', outputPath: 'index.html', type: 'static' },
				undefined,
				undefined
			)
		).resolves.toEqual({});
	});
});

const mkdtempSafe = async (): Promise<string> => {
	const fs = await import('node:fs/promises');
	const os = await import('node:os');
	const path = await import('node:path');
	return await fs.mkdtemp(path.join(os.tmpdir(), 'hidra-test-'));
};
