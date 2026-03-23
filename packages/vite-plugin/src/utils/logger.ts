import type { Logger, LogType } from 'vite';

export const createLogger = (viteLogger: Logger): Logger => {
	return {
		info: (msg: string, opts = {}) => viteLogger.info(msg, opts),
		warn: (msg: string) => viteLogger.warn(msg),
		warnOnce: (msg: string) => viteLogger.warnOnce(msg),
		error: (msg: string, opts = {}) => viteLogger.error(msg, opts),
		clearScreen: (type: LogType) => viteLogger.clearScreen(type),
		hasErrorLogged: (error) => viteLogger.hasErrorLogged(error),
		hasWarned: viteLogger.hasWarned,
	};
};

const isTestEnvironment = (): boolean => {
	return process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
};

export const logError = (message: string, error: unknown): void => {
	if (!isTestEnvironment()) {
		console.error(message, error);
	}
};

export const logWarning = (message: string): void => {
	if (!isTestEnvironment()) {
		console.warn(message);
	}
};
