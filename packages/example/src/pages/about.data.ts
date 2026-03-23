import { loader } from '@hidrajs/loader';

export default loader(async () => {
	return {
		title: 'What is Hidra?',
		description:
			"Hidra is a Vite plugin that brings Handlebars templating to modern multi-page applications. It generates static HTML from your templates at build time — combining Vite's lightning-fast dev server and build pipeline, Handlebars' simple logic-less syntax, and full TypeScript support for your data loaders.",
	};
});
