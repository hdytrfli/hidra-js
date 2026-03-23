import { readFileSync, existsSync } from 'node:fs';
import { join } from 'pathe';
import fastGlob from 'fast-glob';

const ASSET_REGEX = /(?:href|src)=["'](\.\/src\/[^"']+\.(?:css|ts|js))["']/g;

/**
 * Transforms relative asset paths to absolute paths using build manifest.
 */
export const transformAssetPaths = (
	html: string,
	manifest: Record<string, { file: string; css?: string[] }>
): string => {
	const entry = manifest['virtual:hidra-entry'];
	if (!entry?.file) return html;

	let result = html;
	result = result.replace(/src=["']\.?\/src\/assets\/[^"']+\.ts["']/g, `src="/${entry.file}"`);
	for (const css of entry.css || []) {
		result = result.replace(/href=["']\.?\/src\/assets\/[^"']+\.css["']/g, `href="/${css}"`);
	}
	return result;
};

/**
 * Scans layout files for asset imports.
 * Returns array of asset paths referenced in layouts.
 */
export const scanLayoutAssets = (layoutsDir: string): string[] => {
	const assetImports = new Set<string>();
	if (!existsSync(layoutsDir)) return [];

	try {
		const files = fastGlob.sync('*.hbs', { cwd: layoutsDir });

		for (const file of files) {
			const path = join(layoutsDir, file);
			const content = readFileSync(path, 'utf-8');

			for (const match of content.matchAll(ASSET_REGEX)) {
				if (match[1]) {
					assetImports.add(match[1].replace(/^\.\//, '/'));
				}
			}
		}
	} catch {
		return [];
	}

	return Array.from(assetImports);
};
