import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Handlebars from 'handlebars';
import { createHandlebarsInstance } from '@/handlebars/instance.js';
import { registerComponent, registerComponents } from '@/handlebars/component.js';
import { registerHelper, registerHelpers } from '@/handlebars/helper.js';
import type { ResolvedConfig } from '@/types/config.js';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

describe('registerComponent', () => {
	let hbs: typeof Handlebars;

	beforeEach(() => {
		hbs = createHandlebarsInstance();
	});

	it('registers a partial with the given name', () => {
		const source = '<button>{{label}}</button>';
		registerComponent(hbs, 'button', source);
		expect(hbs.partials['button']).toBe(source);
	});

	it('registered partial can be rendered', async () => {
		const source = '<button>{{label}}</button>';
		registerComponent(hbs, 'button', source);

		const template = hbs.compile('{{> button}}');
		const result = await template({ label: 'Click' });

		expect(result).toBe('<button>Click</button>');
	});

	it('re-registering an existing component replaces it', () => {
		registerComponent(hbs, 'btn', '<button>Old</button>');
		expect(hbs.partials['btn']).toBe('<button>Old</button>');

		registerComponent(hbs, 'btn', '<button>New</button>');
		expect(hbs.partials['btn']).toBe('<button>New</button>');
	});
});

describe('registerComponents', () => {
	let tempDir: string;
	const mockConfig: ResolvedConfig = {
		global: 'src/global.ts',
		pages: { dir: 'src/pages' },
		layouts: { dir: 'src/layouts' },
		components: { dir: '' },
		helpers: { dir: 'src/helpers' },
	};

	beforeEach(async () => {
		tempDir = await mkdtempSafe();
		mockConfig.components.dir = tempDir;
	});

	afterEach(async () => {
		await rm(tempDir, { recursive: true, force: true });
	});

	it('files in components/ are registered as partials', async () => {
		await writeFile(join(tempDir, 'button.hbs'), '<button>Btn</button>');
		const hbs = createHandlebarsInstance();
		await registerComponents(hbs, mockConfig);

		expect(hbs.partials['button']).toBeDefined();
	});

	it('registration name strips .hbs extension', async () => {
		await writeFile(join(tempDir, 'card.hbs'), '<div>Card</div>');
		const hbs = createHandlebarsInstance();
		await registerComponents(hbs, mockConfig);

		expect(hbs.partials['card']).toBeDefined();
		expect(hbs.partials['card.hbs']).toBeUndefined();
	});

	it('registration name uses / separator for subdirectory paths', async () => {
		const uiDir = join(tempDir, 'ui');
		await mkdir(uiDir, { recursive: true });
		await writeFile(join(uiDir, 'modal.hbs'), '<div>Modal</div>');

		const hbs = createHandlebarsInstance();
		await registerComponents(hbs, mockConfig);

		expect(hbs.partials['ui/modal']).toBeDefined();
	});

	it('.gitkeep files are skipped', async () => {
		await writeFile(join(tempDir, '.gitkeep'), '');
		const hbs = createHandlebarsInstance();
		await registerComponents(hbs, mockConfig);

		expect(hbs.partials['.gitkeep']).toBeUndefined();
	});

	it('non-.hbs files are skipped', async () => {
		await writeFile(join(tempDir, 'readme.md'), '# Readme');
		const hbs = createHandlebarsInstance();
		await registerComponents(hbs, mockConfig);

		expect(hbs.partials['readme']).toBeUndefined();
	});
});

describe('registerHelper', () => {
	let hbs: typeof Handlebars;

	beforeEach(() => {
		hbs = createHandlebarsInstance();
	});

	it('registers a helper with the given name', () => {
		const fn = (name: string) => 'Hello, ' + name;
		registerHelper(hbs, 'greet', fn as Handlebars.HelperDelegate);

		expect(hbs.helpers['greet']).toBeDefined();
	});

	it('registered helper can be called in template', async () => {
		const fn = (name: string) => 'Hello, ' + name;
		registerHelper(hbs, 'greet', fn as Handlebars.HelperDelegate);

		const template = hbs.compile('{{greet "World"}}');
		const result = await template({});

		expect(result).toBe('Hello, World');
	});

	it('re-registering an existing helper replaces it', () => {
		const fn1 = () => 'First';
		const fn2 = () => 'Second';

		registerHelper(hbs, 'test', fn1 as Handlebars.HelperDelegate);
		const template1 = hbs.compile('{{test}}');

		void template1({});

		registerHelper(hbs, 'test', fn2 as Handlebars.HelperDelegate);
		const template2 = hbs.compile('{{test}}');
		const result = template2({});

		expect(result).toBe('Second');
	});
});

describe('registerHelpers', () => {
	let tempDir: string;
	const mockConfig: ResolvedConfig = {
		global: 'src/global.ts',
		pages: { dir: 'src/pages' },
		layouts: { dir: 'src/layouts' },
		components: { dir: 'src/components' },
		helpers: { dir: '' },
	};

	beforeEach(async () => {
		tempDir = await mkdtempSafe();
		mockConfig.helpers.dir = tempDir;
	});

	afterEach(async () => {
		await rm(tempDir, { recursive: true, force: true });
	});

	it('default export function is registered under the filename', async () => {
		const helperContent = 'export default (name) => "Hello, " + name;';
		await writeFile(join(tempDir, 'greet.ts'), helperContent);

		const hbs = createHandlebarsInstance();
		await registerHelpers(hbs, mockConfig);

		expect(hbs.helpers['greet']).toBeDefined();
	});

	it('.ts extension is stripped from the name', async () => {
		const helperContent = 'export default () => "test";';
		await writeFile(join(tempDir, 'test.ts'), helperContent);

		const hbs = createHandlebarsInstance();
		await registerHelpers(hbs, mockConfig);

		expect(hbs.helpers['test']).toBeDefined();
	});

	it('.js extension is stripped from the name', async () => {
		const helperContent = 'export default () => "test";';
		await writeFile(join(tempDir, 'test.js'), helperContent);

		const hbs = createHandlebarsInstance();
		await registerHelpers(hbs, mockConfig);

		expect(hbs.helpers['test']).toBeDefined();
	});
});

const mkdtempSafe = async (): Promise<string> => {
	const fs = await import('node:fs/promises');
	const os = await import('node:os');
	const path = await import('node:path');
	return await fs.mkdtemp(path.join(os.tmpdir(), 'hidra-test-'));
};
