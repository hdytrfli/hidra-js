export const VIRTUAL_PREFIX = 'virtual:';

export const toVirtualId = (name: string): string =>
	VIRTUAL_PREFIX + name.replace(/\.hbs$/, '.html');

export const isVirtual = (id: string): boolean => id.startsWith(VIRTUAL_PREFIX);

export const getVirtualHtml = (): string =>
	'<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title></title>\n</head>\n<body>\n<!-- hidra-js --></body>\n</html>\n';

export const extractPageNameFromVirtualId = (virtualId: string): string => {
	if (!isVirtual(virtualId)) {
		return '';
	}
	return virtualId.slice(VIRTUAL_PREFIX.length).replace(/\.html$/, '.hbs');
};
