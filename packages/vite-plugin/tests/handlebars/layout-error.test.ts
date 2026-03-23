import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Handlebars from 'handlebars';
import { createHandlebarsInstance } from '@/handlebars/instance.js';
import { setupSectionHelpers } from '@/handlebars/section.js';
import { setupLayoutHelper } from '@/handlebars/layout.js';
import { HidraError } from '@/utils/error.js';
import { ERRORS } from '@/utils/errors.js';
import type { ResolvedConfig } from '@/types/config.js';
import { writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

describe('layout error handling', () => {
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

	it('referencing a layout that does not exist throws HidraError', async () => {
		const pageSource = '{{#layout "nonexistent"}}{{/layout}}';
		const template = hbs.compile(pageSource);

		await expect(async () => {
			await template({});
		}).rejects.toThrow(ERRORS.LAYOUT_NOT_FOUND.message);
	});

	it('circular layout reference throws HidraError with CIRCULAR_LAYOUT code', async () => {
		const layoutASource = '{{#layout "b"}}A{{/layout}}';
		const layoutBSource = '{{#layout "a"}}B{{/layout}}';

		await writeFile(join(tempDir, 'a.hbs'), layoutASource);
		await writeFile(join(tempDir, 'b.hbs'), layoutBSource);

		const template = hbs.compile('{{#layout "a"}}{{/layout}}');

		await expect(async () => {
			await template({});
		}).rejects.toThrow(ERRORS.CIRCULAR_LAYOUT.message);
	});

	it('circular reference error message includes the full chain', async () => {
		const layoutASource = '{{#layout "b"}}A{{/layout}}';
		const layoutBSource = '{{#layout "a"}}B{{/layout}}';

		await writeFile(join(tempDir, 'a.hbs'), layoutASource);
		await writeFile(join(tempDir, 'b.hbs'), layoutBSource);

		const template = hbs.compile('{{#layout "a"}}{{/layout}}');

		try {
			await template({});
		} catch (error) {
			if (error instanceof HidraError) {
				expect(error.code).toBe(ERRORS.CIRCULAR_LAYOUT.code);
				expect(error.context.chain).toBeDefined();
				expect(error.context.chain).toContain('a');
				expect(error.context.chain).toContain('b');
			}
		}
	});
});

const mkdtempSafe = async (): Promise<string> => {
	const fs = await import('node:fs/promises');
	const os = await import('node:os');
	const path = await import('node:path');
	return await fs.mkdtemp(path.join(os.tmpdir(), 'hidra-test-'));
};
