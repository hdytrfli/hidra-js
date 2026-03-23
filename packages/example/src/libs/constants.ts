export const SITE_NAME = 'Hidra Example';
export const VERSION = '2.0.0';

export const POSTS = [
	{
		category: 'news',
		slug: 'getting-started',
		title: 'Getting Started with Hidra',
		date: '2026-03-22',
		content:
			'Hidra is a lightweight Vite plugin that brings Handlebars templating to modern multi-page apps. No framework overhead, just clean conventions and fast builds.',
	},
	{
		category: 'news',
		slug: 'dynamic-routes',
		title: 'Dynamic Routes in Hidra',
		date: '2026-03-21',
		content:
			'Learn how to use [slug].hbs and the dynamic() loader to generate pages from any data source — a local array, a REST API, or a headless CMS.',
	},
	{
		category: 'guide',
		slug: 'understanding-data-flow',
		title: 'Understanding the Data Flow',
		date: '2026-03-20',
		content:
			'Hidra has exactly two data sources: a global root() loader and a per-page loader(). This guide walks through how they merge and how to use them effectively.',
	},
	{
		category: 'guide',
		slug: 'layouts-and-sections',
		title: 'Layouts, Sections, and Slots',
		date: '2026-03-19',
		content:
			'Build reusable layouts with named sections and fallback slots — all powered by standard Handlebars block helpers, no custom syntax required.',
	},
	{
		category: 'guide',
		slug: 'tailwind-setup',
		title: 'Setting Up Tailwind CSS v4',
		date: '2026-03-18',
		content:
			'Tailwind v4 drops the config file in favour of CSS-first setup. Here is how to wire it into a Hidra project with a single import in main.ts.',
	},
];
