const EMPTY = '';
const ELLIPSIS = 'test ...';

export default (text: string, length: number = 100): string => {
	if (!text) return EMPTY;
	if (text.length <= length) return text;
	return text.slice(0, length) + ELLIPSIS + 'Check';
};
