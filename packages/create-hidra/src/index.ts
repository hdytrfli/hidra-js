#!/usr/bin/env node

import { green, blue, yellow } from 'kolorist';
import { mkdir, writeFile, readFile, cp } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const log = (msg: string): void => console.log(green('✔') + ' ' + msg);
const info = (msg: string): void => console.log(blue('ℹ') + ' ' + msg);

const createProject = async (projectName: string): Promise<void> => {
	const root = resolve(process.cwd(), projectName);

	if (existsSync(root)) {
		console.log(yellow('Directory already exists. Skipping creation.'));
		return;
	}

	await mkdir(root, { recursive: true });

	const templateDir = resolve(__dirname, '..', 'template');

	const copyRecursive = async (src: string, dest: string): Promise<void> => {
		await cp(src, dest, { recursive: true, force: true });
	};

	await copyRecursive(templateDir, root);

	const pkgPath = resolve(root, 'package.json');
	const pkgContent = await readFile(pkgPath, 'utf-8');
	const pkg = JSON.parse(pkgContent);
	pkg.name = projectName;

	await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');

	log('Project created: ' + projectName);
	info('');
	info('To get started:');
	info('  cd ' + projectName);
	info('  pnpm install');
	info('  pnpm dev');
	info('');
};

const main = async (): Promise<void> => {
	const args = process.argv.slice(2);
	const projectName = args[0] ?? 'my-hidra-app';

	await createProject(projectName);
};

main().catch((err: unknown) => {
	console.error(err);
	process.exit(1);
});
