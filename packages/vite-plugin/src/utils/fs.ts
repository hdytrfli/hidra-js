import fastGlob from 'fast-glob';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { normalizePath } from '@/utils/path';

export const glob = async (
	pattern: string | string[],
	options?: { cwd?: string; ignore?: string[] }
): Promise<string[]> => {
	const patterns = typeof pattern === 'string' ? [pattern] : pattern;
	const result = await fastGlob(patterns, {
		cwd: options?.cwd ?? '.',
		ignore: options?.ignore ?? [],
		onlyFiles: true,
	});
	return result.map(normalizePath);
};

export const readTextFile = async (filePath: string): Promise<string> => {
	return readFile(filePath, 'utf-8');
};

export const fileExists = (filePath: string): boolean => existsSync(filePath);

export const isExcludedFile = (fileName: string): boolean =>
	fileName.startsWith('_') || fileName === '.gitkeep' || !/\.(hbs|ts|js)$/.test(fileName);
