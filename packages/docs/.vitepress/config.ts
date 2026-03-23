import { defineConfig } from 'vitepress';
import { escape } from './libs/utils';

export default defineConfig({
	title: 'Hidra',
	description: 'Vite + Handlebars Multi-Page Framework',
	lastUpdated: true,
	cleanUrls: true,
	head: [
		['link', { rel: 'icon', href: '/favicon.ico' }],
		['meta', { name: 'theme-color', content: '#3451b2' }],
	],
	markdown: {
		lineNumbers: true,
		config: (md) => {
			const fence = md.renderer.rules.fence!;
			md.renderer.rules.fence = (...args) => escape(fence(...args));

			const code_inline = md.renderer.rules.code_inline!;
			md.renderer.rules.code_inline = (...args) => escape(code_inline(...args));
		},
	},
	themeConfig: {
		siteTitle: 'Hidra',
		nav: [
			{ text: 'Guide', link: '/guide/' },
			{ text: 'API', link: '/api/' },
		],
		sidebar: {
			'/guide/': [
				{
					text: 'Getting Started',
					items: [
						{ text: 'Introduction', link: '/guide/' },
						{ text: 'Installation', link: '/guide/installation' },
						{ text: 'Project Structure', link: '/guide/structure' },
					],
				},
				{
					text: 'Core Concepts',
					items: [
						{ text: 'Pages', link: '/guide/pages' },
						{ text: 'Layouts', link: '/guide/layouts' },
						{ text: 'Components', link: '/guide/components' },
						{ text: 'Data Loading', link: '/guide/data' },
						{ text: 'Dynamic Routes', link: '/guide/dynamic-routes' },
					],
				},
				{
					text: 'Advanced',
					items: [
						{ text: 'Custom Helpers', link: '/guide/helpers' },
						{ text: 'Global Data', link: '/guide/global' },
					],
				},
			],
			'/api/': [
				{
					text: 'API Reference',
					items: [
						{ text: 'Loader API', link: '/api/loader' },
						{ text: 'Vite Plugin', link: '/api/plugin' },
					],
				},
			],
		},
		outline: {
			level: 'deep',
			label: 'On this page',
		},
		docFooter: {
			prev: 'Previous page',
			next: 'Next page',
		},
		socialLinks: [
			{
				icon: 'github',
				link: 'https://github.com/hdytrfli/hidra-js',
			},
		],
		editLink: {
			pattern: 'https://github.com/hdytrfli/hidra-js/edit/main/packages/docs/:path',
			text: 'Edit this page on GitHub',
		},
	},
});
