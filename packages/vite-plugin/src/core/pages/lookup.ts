import type { PageRecord, ExpandedPage } from '@/types/config';
import { extractPageNameFromVirtualId } from '@/core/pages/virtual';

const normalize = (path: string): string => path.replace(/^\//, '').replace(/\/$/, '');

const matchesOutputPath = (pagePath: string, normalized: string): boolean => {
	if (normalized.endsWith('.html') && normalized !== 'index.html') {
		const indexVariant = normalized.replace(/\.html$/, '/index.html');
		return pagePath === indexVariant || pagePath === normalized;
	}
	return pagePath === normalized;
};

/**
 * Finds a page by its output path (e.g., 'about.html').
 * Searches both static and expanded dynamic pages.
 */
export const findPageByOutputPath = (
	pages: PageRecord[],
	outputPath: string
): PageRecord | undefined => {
	const normalized = normalize(outputPath);
	return pages.find((p) => p.outputPath && matchesOutputPath(normalize(p.outputPath), normalized));
};

/**
 * Finds a page by its URL (e.g., '/about').
 * Normalizes URL and searches by output path.
 */
export const findPageByUrl = (pages: PageRecord[], url: string): PageRecord | undefined => {
	let normalized = normalize(url).replace(/\?.*$/, '');
	if (!normalized || normalized === 'index.html') normalized = 'index.html';
	else if (!normalized.endsWith('.html')) normalized += '.html';
	return findPageByOutputPath(pages, normalized);
};

/**
 * Finds an expanded page by its output path.
 * Used for dynamic routes that have been expanded.
 */
export const findPageByOutputPathInExpanded = (
	pages: ExpandedPage[],
	outputPath: string
): ExpandedPage | undefined => {
	const normalized = normalize(outputPath);
	return pages.find((p) => p.outputPath && matchesOutputPath(normalize(p.outputPath), normalized));
};

/**
 * Finds an expanded page by its URL.
 * Used for dynamic routes that have been expanded.
 */
export const findPageByUrlInExpanded = (
	pages: ExpandedPage[],
	url: string
): ExpandedPage | undefined => {
	let normalized = normalize(url).replace(/\?.*$/, '');
	if (!normalized || normalized === 'index.html') normalized = 'index.html';
	else if (!normalized.endsWith('.html')) normalized += '.html';
	return findPageByOutputPathInExpanded(pages, normalized);
};

/**
 * Finds a page by its virtual module path.
 * Used for resolving virtual:hidra-entry module IDs.
 */
export const findPageByVirtualPath = (
	filename: string,
	pages: PageRecord[],
	expandedPages: ExpandedPage[]
): PageRecord | ExpandedPage | undefined => {
	const pageName = extractPageNameFromVirtualId(filename)?.replace(/\.hbs$/, '');
	if (!pageName) return undefined;

	return (
		pages.find((p) => p.id === pageName) || expandedPages.find((p) => p.id.startsWith(pageName))
	);
};
