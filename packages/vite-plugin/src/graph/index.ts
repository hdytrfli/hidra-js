import type { PageRecord } from '@/types/config.js';
import type { ModuleNode } from 'vite';

interface DependencyGraph {
	pageToLayout: Map<string, Set<string>>;
	pageToComponent: Map<string, Set<string>>;
	layoutToComponent: Map<string, Set<string>>;
	layoutToLayout: Map<string, Set<string>>;
}

export const createDependencyGraph = (): DependencyGraph => ({
	pageToLayout: new Map(),
	pageToComponent: new Map(),
	layoutToComponent: new Map(),
	layoutToLayout: new Map(),
});

export const buildGraphFromPages = (pages: PageRecord[]): DependencyGraph => {
	const graph = createDependencyGraph();

	for (const page of pages) {
		graph.pageToLayout.set(page.path, new Set());
		graph.pageToComponent.set(page.path, new Set());
	}

	return graph;
};

/**
 * Get all dependencies (including transitive) from a Vite module node.
 * Traverses the module graph to find all imported files.
 */
export const getAllModuleDependencies = (
	moduleNode: ModuleNode | undefined,
	visited = new Set<string>()
): Set<string> => {
	if (!moduleNode?.id || visited.has(moduleNode.id)) return visited;
	visited.add(moduleNode.id);

	for (const imported of moduleNode.importedModules) {
		getAllModuleDependencies(imported, visited);
	}

	return visited;
};

export const getAffectedPages = (
	graph: DependencyGraph,
	changedFile: string,
	pages: PageRecord[]
): PageRecord[] => {
	const affected = new Set<PageRecord>();

	if (changedFile.includes('/global.ts')) return pages;
	if (changedFile.endsWith('.global.ts')) return pages;

	if (changedFile.endsWith('.data.ts')) {
		const pagePath = changedFile.replace('.data.ts', '.hbs');
		const page = pages.find((page) => page.path === pagePath);
		if (page) affected.add(page);
		return Array.from(affected);
	}

	if (changedFile.includes('/layouts/')) {
		const layoutName = extractLayoutName(changedFile);
		for (const page of pages) {
			const layouts = graph.pageToLayout.get(page.path);
			if (layouts && layouts.has(layoutName)) affected.add(page);
		}
	}

	if (changedFile.includes('/components/')) {
		const componentName = extractComponentName(changedFile);
		for (const page of pages) {
			const components = graph.pageToComponent.get(page.path);
			if (components && components.has(componentName)) affected.add(page);
		}
	}

	if (changedFile.endsWith('.hbs') && changedFile.includes('/pages/')) {
		const page = pages.find((page) => page.path === changedFile);
		if (page) affected.add(page);
	}

	return Array.from(affected);
};

const extractLayoutName = (layoutPath: string): string => {
	const parts = layoutPath.split('/');
	const fileName = parts[parts.length - 1] || '';
	return fileName.replace('.hbs', '');
};

const extractComponentName = (componentPath: string): string => {
	const parts = componentPath.split('/');
	const fileName = parts[parts.length - 1] || '';
	return fileName.replace('.hbs', '');
};
