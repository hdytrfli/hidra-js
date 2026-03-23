import { describe, it, expect } from 'vitest';
import {
	VIRTUAL_PREFIX,
	toVirtualId,
	isVirtual,
	getVirtualHtml,
	extractPageNameFromVirtualId,
} from '@/core/pages/virtual.js';

describe('VIRTUAL_PREFIX', () => {
	it('is defined as virtual:', () => {
		expect(VIRTUAL_PREFIX).toBe('virtual:');
	});
});

describe('toVirtualId', () => {
	it('prepends virtual: prefix to name', () => {
		expect(toVirtualId('index.hbs')).toBe('virtual:index.html');
		expect(toVirtualId('about.hbs')).toBe('virtual:about.html');
	});

	it('replaces .hbs with .html', () => {
		expect(toVirtualId('index.hbs')).toBe('virtual:index.html');
		expect(toVirtualId('blog/post.hbs')).toBe('virtual:blog/post.html');
	});

	it('handles nested paths', () => {
		expect(toVirtualId('blog/[slug].hbs')).toBe('virtual:blog/[slug].html');
	});
});

describe('isVirtual', () => {
	it('returns true for virtual: prefixed ids', () => {
		expect(isVirtual('virtual:index.html')).toBe(true);
		expect(isVirtual('virtual:about.html')).toBe(true);
	});

	it('returns false for non-virtual ids', () => {
		expect(isVirtual('/src/pages/index.hbs')).toBe(false);
		expect(isVirtual('index.html')).toBe(false);
		expect(isVirtual('')).toBe(false);
	});
});

describe('getVirtualHtml', () => {
	it('returns valid HTML boilerplate', () => {
		const html = getVirtualHtml();
		expect(html).toContain('<!DOCTYPE html>');
		expect(html).toContain('<html');
		expect(html).toContain('<head>');
		expect(html).toContain('<body>');
		expect(html).toContain('</html>');
	});

	it('includes meta charset', () => {
		const html = getVirtualHtml();
		expect(html).toContain('charset="UTF-8"');
	});

	it('includes viewport meta', () => {
		const html = getVirtualHtml();
		expect(html).toContain('viewport');
	});

	it('includes hidra-js comment', () => {
		const html = getVirtualHtml();
		expect(html).toContain('hidra-js');
	});
});

describe('extractPageNameFromVirtualId', () => {
	it('extracts page name from virtual id', () => {
		expect(extractPageNameFromVirtualId('virtual:index.html')).toBe('index.hbs');
		expect(extractPageNameFromVirtualId('virtual:about.html')).toBe('about.hbs');
	});

	it('handles nested paths', () => {
		expect(extractPageNameFromVirtualId('virtual:blog/post.html')).toBe('blog/post.hbs');
	});

	it('returns empty string for non-virtual ids', () => {
		expect(extractPageNameFromVirtualId('/src/pages/index.hbs')).toBe('');
		expect(extractPageNameFromVirtualId('')).toBe('');
	});
});
