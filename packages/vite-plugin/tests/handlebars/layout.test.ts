import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Handlebars from 'handlebars';
import { createHandlebarsInstance } from '@/handlebars/instance.js';
import { setupSectionHelpers } from '@/handlebars/section.js';
import { setupLayoutHelper } from '@/handlebars/layout.js';
import type { ResolvedConfig } from '@/types/config.js';
import { writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

describe('setupLayoutHelper', () => {
	let hbs: typeof Handlebars;
	let tempDir: string;
	const mockConfig: ResolvedConfig = {
		global: 'src/global.ts',
		pages: { dir: 'src/pages' },
		layouts: { dir: '' },
		components: { dir: 'src/components' },
		helpers: { dir: 'src/helpers' },
	};

	beforeEach(async () => {
		tempDir = await mkdtempSafe();
		mockConfig.layouts.dir = tempDir;
		hbs = createHandlebarsInstance();
		setupSectionHelpers(hbs);
		setupLayoutHelper(hbs, mockConfig);
	});

	afterEach(async () => {
		await rm(tempDir, { recursive: true, force: true });
	});

	it('renders page content inside layout yield', async () => {
		const layoutSource = '<html><body>{{yield "content"}}</body></html>';
		await writeFile(join(tempDir, 'base.hbs'), layoutSource);

		const pageSource = '{{#layout "base"}}{{#section "content"}}Hello{{/section}}{{/layout}}';
		const template = hbs.compile(pageSource);
		const result = await template({});

		expect(result).toContain('<html><body>Hello</body></html>');
	});

	it('layout receives the same data context as the page', async () => {
		const layoutSource = '<html><body>{{site}}</body></html>';
		await writeFile(join(tempDir, 'base.hbs'), layoutSource);

		const pageSource = '{{#layout "base"}}{{/layout}}';
		const template = hbs.compile(pageSource);
		const result = await template({ site: 'My Site' });

		expect(result).toContain('<html><body>My Site</body></html>');
	});

	it('named sections render in the correct positions', async () => {
		const layoutSource =
			'<html><head>{{yield "title"}}</head><body>{{yield "content"}}</body></html>';
		await writeFile(join(tempDir, 'base.hbs'), layoutSource);

		const pageSource =
			'{{#layout "base"}}{{#section "title"}}Home{{/section}}{{#section "content"}}Welcome{{/section}}{{/layout}}';
		const template = hbs.compile(pageSource);
		const result = await template({});

		expect(result).toContain('<head>Home</head>');
		expect(result).toContain('<body>Welcome</body>');
	});

	it('sections not defined in the page do not render at their yield points', async () => {
		const layoutSource = '<html>{{yield "title"}}|{{yield "content"}}</html>';
		await writeFile(join(tempDir, 'base.hbs'), layoutSource);

		const pageSource =
			'{{#layout "base"}}{{#section "content"}}Only Content{{/section}}{{/layout}}';
		const template = hbs.compile(pageSource);
		const result = await template({});

		expect(result).toBe('<html>|Only Content</html>');
	});

	it('fallback values are used when section is not defined', async () => {
		const layoutSource = '<html>{{yield "title" "Untitled"}}</html>';
		await writeFile(join(tempDir, 'base.hbs'), layoutSource);

		const pageSource = '{{#layout "base"}}{{/layout}}';
		const template = hbs.compile(pageSource);
		const result = await template({});

		expect(result).toBe('<html>Untitled</html>');
	});
});

const mkdtempSafe = async (): Promise<string> => {
	const fs = await import('node:fs/promises');
	const os = await import('node:os');
	const path = await import('node:path');
	return await fs.mkdtemp(path.join(os.tmpdir(), 'hidra-test-'));
};
