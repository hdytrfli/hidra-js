/**
 * Helper functions for server-side operations.
 * Used in dev server middleware and HMR watcher.
 */
export const endWithArray = (str: string, suffixes: string[]): boolean => {
	for (const suffix of suffixes) {
		if (str.endsWith(suffix)) return true;
	}
	return false;
};
