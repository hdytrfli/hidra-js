import { normalize, sep, posix } from 'pathe';

export const toKebabCase = (str: string): string =>
	str
		.replace(/([a-z])([A-Z])/g, '$1-$2')
		.replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
		.replace(/_/g, '-')
		.toLowerCase();

export const derivePartialName = (filePath: string): string => {
	const normalized = normalize(filePath);
	const name = normalized.replace(/\.hbs$/, '').replace(/^src[\\/]components[\\/]/, '');
	return name.split(sep).join('/');
};

export const deriveHelperName = (filePath: string): string => {
	const normalized = normalize(filePath);
	const fileName = normalized.split(sep).pop() || normalized;
	return toKebabCase(fileName.replace(/\.(ts|js)$/, ''));
};

export const deriveOutputPath = (filePath: string): string => {
	const normalized = normalize(filePath);
	const withoutPages = normalized.replace(/^src[\\/]pages[\\/]/, '');
	const withoutExt = withoutPages.replace(/\.hbs$/, '.html');

	if (withoutExt.endsWith('/index.html')) return withoutExt.replace(/\/index\.html$/, '.html');

	return withoutExt;
};

export const isDynamicPath = (filePath: string): boolean => filePath.includes('[');

export const extractDynamicParams = (filePath: string): string[] => {
	const matches = filePath.match(/\[([^\]]+)\]/g);
	if (!matches) return [];
	return matches.map((match) => match.slice(1, -1));
};

export const extractDynamicParamsAsRecord = (filePath: string): Record<string, string> => {
	const matches = filePath.match(/\[([^\]]+)\]/g);
	if (!matches) return {};
	const params: Record<string, string> = {};
	for (const match of matches) {
		const key = match.slice(1, -1);
		params[key] = '';
	}
	return params;
};

export const buildUrlFromParams = (basePath: string, params: Record<string, string>): string => {
	let url = basePath;
	for (const [key, value] of Object.entries(params)) {
		url = url.replace('[' + key + ']', value);
	}
	url = url.replace(/\.hbs$/, '.html');
	if (!url.startsWith('/')) url = '/' + url;
	return url;
};

export const normalizePath = (path: string): string => normalize(path).split(sep).join(posix.sep);
