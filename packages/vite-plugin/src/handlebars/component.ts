import type { ResolvedConfig } from '@/types/config.js';
import type Handlebars from 'handlebars';
import { glob, isExcludedFile } from '@/utils/fs.js';
import { derivePartialName } from '@/utils/path.js';
import { readTextFile } from '@/utils/fs.js';

export const registerComponents = async (
	hbs: typeof Handlebars,
	config: ResolvedConfig
): Promise<void> => {
	const files = await glob('**/*.hbs', { cwd: config.components.dir });
	const hbsFiles = files.filter((file) => !isExcludedFile(file));

	for (const file of hbsFiles) {
		const name = derivePartialName(file);
		const fullPath = config.components.dir + '/' + file;
		const source = await readTextFile(fullPath);
		hbs.registerPartial(name, source);
	}
};

export const registerComponent = (hbs: typeof Handlebars, name: string, source: string): void => {
	hbs.registerPartial(name, source);
};
