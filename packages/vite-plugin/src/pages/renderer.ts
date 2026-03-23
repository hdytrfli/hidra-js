import type { ResolvedConfig } from '@/types/config.js';
import { HidraError } from '@/utils/error';
import { ERRORS } from '@/utils/errors';
import { readTextFile } from '@/utils/fs.js';

export const renderPageWithLayout = async (
	templatePath: string,
	context: Record<string, unknown>,
	config: ResolvedConfig,
	handlebarsInstance: typeof import('handlebars') | null
): Promise<string> => {
	if (!handlebarsInstance) throw new HidraError(ERRORS.HANDLEBARS_NOT_INITIALIZED);
	const source = await readTextFile(templatePath);
	const compiled = handlebarsInstance.compile(source);
	return compiled(context);
};

export const renderTemplate = async (
	templateSource: string,
	context: Record<string, unknown>,
	handlebarsInstance: typeof import('handlebars')
): Promise<string> => {
	const compiled = handlebarsInstance.compile(templateSource);
	return compiled(context);
};
