# Data Loading

Hidra provides a powerful data loading system that lets you fetch data at build time and pass it to your templates.

## Page Data Loaders

Each page can optionally have a corresponding `.data.ts` file:

```
src/pages/
├── index.hbs
├── index.data.ts    ← Optional
├── about.hbs
└── about.data.ts    ← Optional
```

**Note:** `.data.ts` files are completely optional. Pages without a data file will still render normally.

### Using the Loader

```typescript
// src/pages/about.data.ts
import { loader } from '@hidrajs/loader';
import type { PageMeta } from '@hidrajs/loader';

export default loader(async ({ page }: { page: PageMeta }) => ({
	title: 'About Us',
	team: [
		{ name: 'Alice', role: 'CEO' },
		{ name: 'Bob', role: 'CTO' },
	],
}));
```

```handlebars
{{! src/pages/about.hbs }}
{{#layout 'base'}}
	{{#section 'title'}}{{title}}{{/section}}
	{{#section 'content'}}
		<h1>{{title}}</h1>
		<ul>
			{{#each team}}
				<li>{{name}} - {{role}}</li>
			{{/each}}
		</ul>
	{{/section}}
{{/layout}}
```

### Accessing Data in Templates

Data returned from loaders is available at the **root level** of your templates:

```handlebars
{{! Direct access - no need for page.props.title }}
{{title}}
{{team}}

{{! Also available via page object }}
{{page.props.title}}
{{page.props.team}}
```

This provides a consistent DX across all pages, whether they use data loaders or not.

## Global Data

Share data across all pages using `src/global.ts` (optional):

```typescript
// src/global.ts
import { root } from '@hidrajs/loader';

export default root(async () => ({
	site: 'My Website',
	year: new Date().getFullYear(),
	navigation: [
		{ label: 'Home', href: '/' },
		{ label: 'About', href: '/about' },
		{ label: 'Blog', href: '/blog' },
	],
}));
```

**Note:** The global data file is completely optional. If it doesn't exist, your app will work normally with just page-level data.

Global data is merged with page data and available in all templates.

## Dynamic Route Data

Dynamic routes use a `dynamic()` export to generate pages:

```typescript
// src/pages/blog/[slug].data.ts
import { dynamic } from '@hidrajs/loader';

export default dynamic(async () => {
	return [
		{
			params: { slug: 'hello-world' },
			props: {
				title: 'Hello World',
				date: '2026-03-22',
			},
		},
		{
			params: { slug: 'second-post' },
			props: {
				title: 'Second Post',
				date: '2026-03-21',
			},
		},
	];
});
```

### How It Works

1. **`dynamic()`** returns an array of route definitions with `params` and `props`
2. Hidra generates a page for each entry
3. Data from `props` is available at the root level in your template

### Accessing Dynamic Data

```handlebars
{{! src/pages/blog/[slug].hbs }}
{{#layout 'base'}}
	{{! From dynamic() props - available at root level }}
	{{title}}
	{{date}}

	{{! Page metadata }}
	{{page.params.slug}}
	{{page.url}}
{{/layout}}
```

**Note:** Unlike static pages, dynamic routes don't use a separate `loader()` - all data comes from the `props` returned by `dynamic()`.

## Data Loading Lifecycle

1. **Global Data** - `src/global.ts` loads first
2. **Page Data** - Each page's `.data.ts` loads
3. **Merge** - Global and page data are merged
4. **Render** - Template renders with merged data

## Async Data Loading

Loaders support async operations:

```typescript
// src/pages/blog.data.ts
import { loader } from '@hidrajs/loader';

export default loader(async () => {
	const response = await fetch('https://api.example.com/posts');
	const posts = await response.json();

	return {
		posts: posts.map((post: any) => ({
			title: post.title,
			excerpt: post.excerpt,
			slug: post.slug,
		})),
	};
});
```

## File System Data

Read data from local files:

```typescript
// src/pages/team.data.ts
import { loader } from '@hidrajs/loader';
import { readFile } from 'node:fs/promises';

export default loader(async () => {
	const data = await readFile('./src/data/team.json', 'utf-8');
	return {
		team: JSON.parse(data),
	};
});
```

## Error Handling

Handle errors gracefully in your loaders:

```typescript
// src/pages/blog.data.ts
import { loader } from '@hidrajs/loader';

export default loader(async () => {
	try {
		const response = await fetch('https://api.example.com/posts');
		if (!response.ok) throw new Error('Failed to fetch posts');
		return {
			posts: await response.json(),
		};
	} catch (error) {
		console.error('Error loading posts:', error);
		return {
			posts: [],
			error: 'Unable to load posts',
		};
	}
});
```

## Next Steps

- [Dynamic Routes](/guide/dynamic-routes) - Generate pages from data
- [Custom Helpers](/guide/helpers) - Create custom Handlebars helpers
