import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadGlobalData } from '@/data/global.js';
import { writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

describe('loadGlobalData', () => {
	let tempDir: string;

	beforeEach(async () => {
		tempDir = await mkdtempSafe();
	});

	afterEach(async () => {
		await rm(tempDir, { recursive: true, force: true });
	});

	it('root() export is called and its return value is used as global context', async () => {
		const globalContent = 'export default async function root() { return { site: "Test" }; }';
		await writeFile(join(tempDir, 'global.ts'), globalContent);
		const data = await loadGlobalData(tempDir + '/global.ts', Date.now(), undefined, undefined);
		expect(data).toEqual({ site: 'Test' });
	});

	it('async root() is awaited correctly', async () => {
		const globalContent = `
			export default async function root() {
				await new Promise(resolve => setTimeout(resolve, 10));
				return { async: true };
			}
		`;
		await writeFile(join(tempDir, 'global.ts'), globalContent);

		const data = await loadGlobalData(tempDir + '/global.ts', Date.now(), undefined, undefined);

		expect(data).toEqual({ async: true });
	});

	it('return value is a plain object available to all templates', async () => {
		const globalContent =
			'export default async function root() { return { site: "App", year: 2026 }; }';
		await writeFile(join(tempDir, 'global.ts'), globalContent);

		const data = await loadGlobalData(tempDir + '/global.ts', Date.now(), undefined, undefined);

		expect(data).toEqual({ site: 'App', year: 2026 });
	});

	it('missing src/global.ts returns empty object - not an error', async () => {
		const data = await loadGlobalData(
			tempDir + '/nonexistent.ts',
			Date.now(),
			undefined,
			undefined
		);
		expect(data).toEqual({});
	});

	it('misconfigured global path that does not exist returns empty object', async () => {
		const data = await loadGlobalData(
			'/nonexistent/path/global.ts',
			Date.now(),
			undefined,
			undefined
		);
		expect(data).toEqual({});
	});
});

const mkdtempSafe = async (): Promise<string> => {
	const fs = await import('node:fs/promises');
	const os = await import('node:os');
	const path = await import('node:path');
	return await fs.mkdtemp(path.join(os.tmpdir(), 'hidra-test-'));
};
