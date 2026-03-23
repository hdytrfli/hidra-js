import { ERRORS } from '@/utils/errors.js';
import { HidraError } from '@/utils/error.js';
import type { PageRecord } from '@/types/config.js';
import { glob, isExcludedFile } from '@/utils/fs.js';
import { deriveOutputPath, isDynamicPath, extractDynamicParamsAsRecord } from '@/utils/path.js';

export const discoverPages = async (pagesDir: string): Promise<PageRecord[]> => {
	const files = await glob('**/*.hbs', { cwd: pagesDir });
	const hbsFiles = files.filter((file) => !isExcludedFile(file));

	const pages: PageRecord[] = hbsFiles.map((file) => {
		const path = pagesDir + '/' + file;
		const outputPath = deriveOutputPath(file);
		const type: 'static' | 'dynamic' = isDynamicPath(file) ? 'dynamic' : 'static';
		const params = extractDynamicParamsAsRecord(file);

		return {
			id: file.replace(/\.hbs$/, ''),
			path,
			outputPath: type === 'static' ? outputPath : undefined,
			type,
			params,
			props: {},
		};
	});

	detectConflicts(pages);

	return pages;
};

const detectConflicts = (pages: PageRecord[]): void => {
	const outputPaths = new Map<string, string[]>();

	for (const page of pages) {
		if (!page.outputPath) continue;

		const normalized = normalizeOutputPath(page.outputPath);
		const existing = outputPaths.get(normalized);

		if (existing) {
			existing.push(page.path);
			throw new HidraError(ERRORS.PAGE_CONFLICT, {
				path1: existing[0] || '',
				path2: page.path,
			});
		}

		outputPaths.set(normalized, [page.path]);
	}
};

const normalizeOutputPath = (outputPath: string): string => {
	let normalized = outputPath.replace(/\\/g, '/');

	if (normalized.endsWith('/index.html')) {
		normalized = normalized.slice(0, -10);
	} else if (normalized.endsWith('.html')) {
		normalized = normalized.slice(0, -5);
	}

	return normalized.replace(/\/$/, '');
};
