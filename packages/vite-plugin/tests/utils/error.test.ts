import { describe, it, expect } from 'vitest';
import { HidraError } from '@/utils/error.js';
import { ERRORS } from '@/utils/errors.js';

describe('HidraError', () => {
	it('is an instance of Error', () => {
		const error = new HidraError(ERRORS.INVALID_INPUT);
		expect(error).toBeInstanceOf(Error);
	});

	it('has name set to HidraError', () => {
		const error = new HidraError(ERRORS.INVALID_INPUT);
		expect(error.name).toBe('HidraError');
	});

	it('carries the code property', () => {
		const error = new HidraError(ERRORS.LAYOUT_NOT_FOUND);
		expect(error.code).toBe(ERRORS.LAYOUT_NOT_FOUND.code);
	});

	it('carries the message property', () => {
		const error = new HidraError(ERRORS.INVALID_INPUT);
		expect(error.message).toBe(ERRORS.INVALID_INPUT.message);
	});

	it('carries the context property', () => {
		const error = new HidraError(ERRORS.PAGE_CONFLICT, { path1: 'a', path2: 'b' });
		expect(error.context).toEqual({ path1: 'a', path2: 'b' });
	});

	it('context defaults to {} when not provided', () => {
		const error = new HidraError(ERRORS.INVALID_INPUT);
		expect(error.context).toEqual({});
	});

	it('stack trace is preserved', () => {
		const error = new HidraError(ERRORS.INVALID_INPUT);
		expect(error.stack).toBeDefined();
		expect(typeof error.stack).toBe('string');
	});

	it('can be caught as a standard Error', () => {
		try {
			throw new HidraError(ERRORS.INVALID_INPUT);
		} catch (e) {
			expect(e).toBeInstanceOf(Error);
			expect((e as HidraError).message).toBe(ERRORS.INVALID_INPUT.message);
		}
	});
});
