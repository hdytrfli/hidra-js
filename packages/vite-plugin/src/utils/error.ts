import type { ErrorCode, ErrorType } from '@/utils/errors.js';

export class HidraError extends Error {
	readonly code: ErrorCode;
	readonly type: ErrorType;
	readonly context: Record<string, string>;

	constructor(type: ErrorType, context: Record<string, string> = {}) {
		super(type.message);
		this.type = type;
		this.code = type.code;
		this.name = 'HidraError';
		this.context = context;
	}
}
