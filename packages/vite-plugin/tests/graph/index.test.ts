import { describe, it, expect } from 'vitest';
import type { PageRecord } from '@/types/config.js';
import { createDependencyGraph, buildGraphFromPages, getAffectedPages } from '@/graph/index.js';

describe('createDependencyGraph', () => {
	it('creates a graph with empty maps', () => {
		const graph = createDependencyGraph();

		expect(graph.pageToLayout).toBeInstanceOf(Map);
		expect(graph.pageToComponent).toBeInstanceOf(Map);
		expect(graph.layoutToComponent).toBeInstanceOf(Map);
		expect(graph.layoutToLayout).toBeInstanceOf(Map);
	});

	it('all maps are initially empty', () => {
		const graph = createDependencyGraph();

		expect(graph.pageToLayout.size).toBe(0);
		expect(graph.pageToComponent.size).toBe(0);
		expect(graph.layoutToComponent.size).toBe(0);
		expect(graph.layoutToLayout.size).toBe(0);
	});
});

describe('buildGraphFromPages', () => {
	it('creates entries for each page', () => {
		const pages: PageRecord[] = [
			{ id: 'index', path: 'src/pages/index.hbs', outputPath: 'index.html', type: 'static' },
			{ id: 'about', path: 'src/pages/about.hbs', outputPath: 'about.html', type: 'static' },
		];

		const graph = buildGraphFromPages(pages, 'src/layouts');

		expect(graph.pageToLayout.has('src/pages/index.hbs')).toBe(true);
		expect(graph.pageToLayout.has('src/pages/about.hbs')).toBe(true);
	});

	it('initializes empty dependency sets for each page', () => {
		const pages: PageRecord[] = [
			{ id: 'index', path: 'src/pages/index.hbs', outputPath: 'index.html', type: 'static' },
		];

		const graph = buildGraphFromPages(pages, 'src/layouts');

		expect(graph.pageToLayout.get('src/pages/index.hbs')).toEqual(new Set());
		expect(graph.pageToComponent.get('src/pages/index.hbs')).toEqual(new Set());
	});
});

describe('getAffectedPages', () => {
	const pages: PageRecord[] = [
		{ id: 'index', path: 'src/pages/index.hbs', outputPath: 'index.html', type: 'static' },
		{ id: 'about', path: 'src/pages/about.hbs', outputPath: 'about.html', type: 'static' },
		{
			id: 'post',
			path: 'src/pages/blog/[slug].hbs',
			outputPath: undefined,
			type: 'dynamic',
			params: ['slug'],
		},
	];

	it('changing global.ts returns all pages', () => {
		const graph = createDependencyGraph();
		const affected = getAffectedPages(graph, 'src/global.ts', pages);

		expect(affected).toHaveLength(3);
	});

	it('changing a page file returns only that page', () => {
		const graph = createDependencyGraph();
		const affected = getAffectedPages(graph, 'src/pages/about.hbs', pages);

		expect(affected).toHaveLength(1);
		expect(affected[0]?.path).toBe('src/pages/about.hbs');
	});

	it('changing a .data.ts file returns only its associated page', () => {
		const graph = createDependencyGraph();
		const affected = getAffectedPages(graph, 'src/pages/about.data.ts', pages);

		expect(affected).toHaveLength(1);
		expect(affected[0]?.path).toBe('src/pages/about.hbs');
	});

	it('returns empty array for unrelated files', () => {
		const graph = createDependencyGraph();
		const affected = getAffectedPages(graph, 'src/assets/main.css', pages);

		expect(affected).toHaveLength(0);
	});
});
