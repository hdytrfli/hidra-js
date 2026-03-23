import { describe, it, expect, beforeEach } from 'vitest';
import Handlebars from 'handlebars';
import { createHandlebarsInstance } from '@/handlebars/instance.js';
import { registerHelper } from '@/handlebars/helper.js';

describe('helper registration', () => {
	let hbs: typeof Handlebars;

	beforeEach(() => {
		hbs = createHandlebarsInstance();
	});

	it('helper can be called with arguments', async () => {
		const fn = (a: number, b: number) => a + b;
		registerHelper(hbs, 'add', fn as Handlebars.HelperDelegate);

		const template = hbs.compile('{{add 5 3}}');
		const result = await template({});

		expect(result).toBe('8');
	});

	it('helper has access to Handlebars context', async () => {
		const fn = function (this: unknown, prop: string) {
			const ctx = this as Record<string, unknown>;
			return String(ctx[prop] ?? '');
		};
		registerHelper(hbs, 'get', fn as Handlebars.HelperDelegate);

		const template = hbs.compile('{{get "name"}}');
		const result = await template({ name: 'Test' });

		expect(result).toBe('Test');
	});
});

describe('block helpers', () => {
	let hbs: typeof Handlebars;

	beforeEach(() => {
		hbs = createHandlebarsInstance();
	});

	it('block helper with options.fn renders inner block content', async () => {
		const fn = function (this: unknown, options: Handlebars.HelperOptions) {
			return 'Wrapper: ' + options.fn(this);
		};
		registerHelper(hbs, 'wrap', fn as Handlebars.HelperDelegate);

		const template = hbs.compile('{{#wrap}}Content{{/wrap}}');
		const result = await template({});

		expect(result).toBe('Wrapper: Content');
	});

	it('block helper with options.inverse renders else block content', async () => {
		const fn = function (this: unknown, condition: boolean, options: Handlebars.HelperOptions) {
			if (condition) {
				return options.fn(this);
			}
			return options.inverse(this);
		};
		registerHelper(hbs, 'ifCustom', fn as Handlebars.HelperDelegate);

		const templateTrue = hbs.compile('{{#ifCustom true}}Yes{{else}}No{{/ifCustom}}');
		const resultTrue = await templateTrue({});
		expect(resultTrue).toBe('Yes');

		const templateFalse = hbs.compile('{{#ifCustom false}}Yes{{else}}No{{/ifCustom}}');
		const resultFalse = await templateFalse({});
		expect(resultFalse).toBe('No');
	});

	it('block helper can iterate with custom context', async () => {
		const fn = function (this: unknown, count: number, options: Handlebars.HelperOptions) {
			let result = '';
			for (let i = 0; i < count; i++) {
				result += options.fn({ index: i });
			}
			return result;
		};
		registerHelper(hbs, 'repeat', fn as Handlebars.HelperDelegate);

		const template = hbs.compile('{{#repeat 3}}Item {{index}}\n{{/repeat}}');
		const result = await template({});

		expect(result).toBe('Item 0\nItem 1\nItem 2\n');
	});
});
