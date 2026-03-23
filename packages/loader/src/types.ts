/**
 * Metadata about the current page, injected by the plugin.
 */
export type PageMeta = {
	/** Output URL path e.g. `/blog/hello-world`. */
	url: string;
	/** Source file path e.g. `src/pages/blog/[slug].hbs`. */
	path: string;
	/** URL params from dynamic segments e.g. `{ slug: 'hello-world' }`. */
	params: Record<string, string>;
	/** Data returned from loader() or dynamic(). Accessible as `page.props.*`. */
	props: Record<string, unknown>;
	/** Inferred by the plugin. Never set by the user. */
	type: 'static' | 'dynamic';
};

/**
 * Entry returned by dynamic() to generate multiple pages from a single template.
 */
export type DynamicEntry = {
	/** URL params that fill dynamic segments in the route. */
	params: Record<string, string>;
	/** Data passed to the template via page.props. */
	props: Record<string, unknown>;
};
