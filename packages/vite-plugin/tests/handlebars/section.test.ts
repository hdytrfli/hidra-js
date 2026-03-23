import { describe, it, expect, beforeEach } from 'vitest';
import Handlebars from 'handlebars';
import { setupSectionHelpers } from '@/handlebars/section.js';

describe('setupSectionHelpers', () => {
	let hbs: typeof Handlebars;

	beforeEach(() => {
		hbs = Handlebars.create();
		setupSectionHelpers(hbs);
	});

	describe('{{#section}}', () => {
		it('content is stored and retrievable by name', async () => {
			const template = hbs.compile('{{#section "title"}}Hello{{/section}}{{yield "title"}}');
			const result = await template({});
			expect(result).toBe('Hello');
		});

		it('multiple sections with different names are stored independently', async () => {
			const source =
				'{{#section "title"}}Title{{/section}}{{#section "content"}}Content{{/section}}{{yield "title"}}|{{yield "content"}}';
			const template = hbs.compile(source);
			const result = await template({});
			expect(result).toBe('Title|Content');
		});

		it('a section defined twice - last definition wins', async () => {
			const source =
				'{{#section "title"}}First{{/section}}{{#section "title"}}Second{{/section}}{{yield "title"}}';
			const template = hbs.compile(source);
			const result = await template({});
			expect(result).toBe('Second');
		});

		it('section content can contain Handlebars expressions', async () => {
			const source = '{{#section "greeting"}}Hello, {{name}}!{{/section}}{{yield "greeting"}}';
			const template = hbs.compile(source);
			const result = await template({ name: 'World' });
			expect(result).toBe('Hello, World!');
		});
	});

	describe('{{yield}}', () => {
		it('renders stored section content by name', async () => {
			const source = '{{#section "title"}}My Title{{/section}}{{yield "title"}}';
			const template = hbs.compile(source);
			const result = await template({});
			expect(result).toBe('My Title');
		});

		it('returns empty string when section not defined and no fallback given', async () => {
			const template = hbs.compile('{{yield "undefined"}}');
			const result = await template({});
			expect(result).toBe('');
		});

		it('returns inline fallback when section not defined', async () => {
			const template = hbs.compile('{{yield "title" "Default Title"}}');
			const result = await template({});
			expect(result).toBe('Default Title');
		});

		it('returns block fallback when section not defined', async () => {
			const template = hbs.compile('{{#yield "sidebar"}}<nav>Sidebar</nav>{{/yield}}');
			const result = await template({});
			expect(result).toBe('<nav>Sidebar</nav>');
		});

		it('block fallback can reference data context', async () => {
			const source = '{{#yield "footer"}}Copyright {{year}}{{/yield}}';
			const template = hbs.compile(source);
			const result = await template({ year: 2026 });
			expect(result).toBe('Copyright 2026');
		});

		it('section content takes precedence over fallback', async () => {
			const source = '{{#section "title"}}Custom{{/section}}{{yield "title" "Default"}}';
			const template = hbs.compile(source);
			const result = await template({});
			expect(result).toBe('Custom');
		});
	});

	describe('section scope', () => {
		it('section map is scoped per render', async () => {
			const source = '{{#section "content"}}A{{/section}}{{yield "content"}}';
			const template = hbs.compile(source);
			const result1 = await template({});
			const result2 = await template({});
			expect(result1).toBe('A');
			expect(result2).toBe('A');
		});
	});
});
