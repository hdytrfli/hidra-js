import merge from 'lodash.merge';

export const mergeContext = (
	globalData: Record<string, unknown>,
	pageProps: Record<string, unknown>,
	pageMeta: Record<string, unknown>
): Record<string, unknown> => {
	const merged = merge({}, globalData);

	merged.page = merge({}, pageMeta, {
		props: pageProps,
	});

	return merged;
};
