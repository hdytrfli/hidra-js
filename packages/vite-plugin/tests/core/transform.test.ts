import { describe, it, expect } from 'vitest';
import { injectContentIntoHtml } from '@/core/rendering/transform.js';

describe('injectContentIntoHtml', () => {
	it('injects content after opening body tag', () => {
		const html = '<!DOCTYPE html><html><head></head><body></body></html>';
		const content = '<h1>Hello</h1>';
		const result = injectContentIntoHtml(html, content);
		expect(result).toContain('<body>');
		expect(result).toContain('<h1>Hello</h1>');
		expect(result.indexOf('<h1>Hello</h1>')).toBeGreaterThan(result.indexOf('<body>'));
	});

	it('handles body tag with attributes', () => {
		const html = '<!DOCTYPE html><html><body class="app"></body></html>';
		const content = '<main>Content</main>';
		const result = injectContentIntoHtml(html, content);
		expect(result).toContain('<body class="app">');
		expect(result).toContain('<main>Content</main>');
	});

	it('handles multiline HTML', () => {
		const html = `<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
</body>
</html>`;
		const content = '<div>Injected</div>';
		const result = injectContentIntoHtml(html, content);
		expect(result).toContain('<div>Injected</div>');
	});

	it('returns content if no body tag found', () => {
		const html = '<div>No body tag</div>';
		const content = '<h1>Content</h1>';
		const result = injectContentIntoHtml(html, content);
		expect(result).toBe(content);
	});
});
