export const ERRORS = {
	LAYOUT_NOT_FOUND: {
		code: 'layout_not_found',
		message: 'Layout file not found',
	},
	CIRCULAR_LAYOUT: {
		code: 'circular_layout',
		message: 'Circular layout reference detected',
	},
	MAX_LAYOUT_DEPTH: {
		code: 'max_layout_depth',
		message: 'Layout nesting exceeds maximum depth',
	},
	PAGE_CONFLICT: {
		code: 'page_conflict',
		message: 'Multiple pages resolve to the same output path',
	},
	MISSING_DYNAMIC_DATA: {
		code: 'missing_dynamic_data',
		message: 'Dynamic route is missing data file with dynamic() export',
	},
	INVALID_DYNAMIC_EXPORT: {
		code: 'invalid_dynamic_export',
		message: 'Data file must export a dynamic() function',
	},
	DYNAMIC_LOAD_FAILED: {
		code: 'dynamic_load_failed',
		message: 'Failed to load dynamic route data',
	},
	GLOBAL_LOAD_FAILED: {
		code: 'global_load_failed',
		message: 'Failed to load global data',
	},
	LOADER_FAILED: {
		code: 'loader_failed',
		message: 'Failed to load page data',
	},
	INVALID_INPUT: {
		code: 'invalid_input',
		message: 'Invalid input provided',
	},
	EMPTY: {
		code: 'empty',
		message: 'Expected value is empty',
	},
	VIRTUAL_PAGE_NOT_FOUND: {
		code: 'virtual_page_not_found',
		message: 'Virtual page not found',
	},
	DYNAMIC_PAGE_NOT_FOUND: {
		code: 'dynamic_page_not_found',
		message: 'Dynamic page not found',
	},
	HANDLEBARS_NOT_INITIALIZED: {
		code: 'handlebars_not_initialized',
		message: 'Handlebars instance not initialized',
	},
} as const;

export type ErrorKey = keyof typeof ERRORS;
export type ErrorType = (typeof ERRORS)[ErrorKey];
export type ErrorCode = ErrorType['code'];
