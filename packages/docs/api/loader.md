# Loader API

The Loader API provides functions for loading data in your Hidra application.

## Installation

```bash
pnpm add @hidrajs/loader
```

## `loader()`

Creates a page data loader function.

### Signature

```typescript
function loader<T>(fn: (context: LoaderContext) => Promise<T>): () => Promise<T>;
```

### Usage

```typescript
// src/pages/about.data.ts
import { loader } from '@hidrajs/loader';
import type { PageMeta } from '@hidrajs/loader';

export default loader(async ({ page }: { page: PageMeta }) => ({
	title: 'About Us',
	team: ['Alice', 'Bob', 'Charlie'],
}));
```

### LoaderContext

The context object passed to your loader function:

```typescript
interface LoaderContext {
	/** Page metadata including path, params, and URL */
	page: PageMeta;
}

interface PageMeta {
	/** Page identifier (file path without extension) */
	id: string;

	/** Full file path */
	path: string;

	/** Output path (for static pages) */
	outputPath?: string;

	/** Page type: 'static' or 'dynamic' */
	type: 'static' | 'dynamic';

	/** Dynamic route parameter names */
	params: string[];

	/** Page URL */
	url: string;

	/** Additional page props from data loaders */
	props: Record<string, unknown>;
}
```

## `root()`

Creates a global data loader function.

### Signature

```typescript
function root<T>(fn: () => Promise<T>): () => Promise<T>;
```

### Usage

```typescript
// src/global.ts
import { root } from '@hidrajs/loader';

export default root(async () => ({
	site: 'My Website',
	year: new Date().getFullYear(),
}));
```

## `dynamic()`

Defines dynamic route paths for page generation.

### Signature

```typescript
function dynamic<T extends DynamicRouteEntry>(fn: () => Promise<T[]>): () => Promise<T[]>;

interface DynamicRouteEntry {
	params: Record<string, string>; // Route parameters
	props?: Record<string, unknown>; // Data passed to template
}
```

### Usage

```typescript
// src/pages/blog/[slug].data.ts
import { dynamic } from '@hidrajs/loader';

export default dynamic(async () => {
	return [
		{
			params: { slug: 'hello-world' },
			props: {
				title: 'Hello World',
				excerpt: 'My first post!',
			},
		},
		{
			params: { slug: 'second-post' },
			props: {
				title: 'Second Post',
				excerpt: 'Another post!',
			},
		},
	];
});
```

### Return Type

The `dynamic()` function must return an array of objects with `params` and optional `props`:

- **`params`**: A record of parameter names to values (e.g., `{ slug: 'hello-world' }`)
- **`props`**: Data that will be available in the template at root level

For multiple dynamic segments:

```typescript
export default dynamic(async () => {
	return [
		{
			params: { category: 'tech', slug: 'hello-world' },
			props: { title: 'Hello World' },
		},
	];
});
```

### How Dynamic Routes Work

1. `dynamic()` returns an array of route definitions
2. Hidra generates one page for each entry
3. The `props` from each entry are merged into the template context
4. In your template, access props at root level: `{{title}}`, not `{{page.props.title}}`

**Note:** For dynamic routes, all data comes from `dynamic()`. There's no separate `loader()` call.

## Examples

### Basic Page Loader

```typescript
import { loader } from '@hidrajs/loader';

export default loader(async () => ({
	title: 'Home',
	message: 'Welcome!',
}));
```

### Loader with Page Metadata

```typescript
import { loader } from '@hidrajs/loader';
import type { PageMeta } from '@hidrajs/loader';

export default loader(async ({ page }) => ({
	title: page.props.title || 'Default',
	url: page.url,
	isDynamic: page.type === 'dynamic',
}));
```

### Dynamic Route

```typescript
import { dynamic } from '@hidrajs/loader';

export default dynamic(async () => {
	const response = await fetch('https://api.example.com/posts');
	const posts = await response.json();

	return posts.map((post) => ({
		params: { slug: post.slug },
		props: {
			title: post.title,
			excerpt: post.excerpt,
		},
	}));
});
```

**Note:** For dynamic routes, all data comes from `dynamic()` - there's no separate `loader()` call. The `props` returned are available at root level in your template.

### Global Data with Environment Variables

```typescript
import { root } from '@hidrajs/loader';

export default root(async () => ({
	site: 'My Site',
	isDev: process.env.NODE_ENV === 'development',
	analytics: process.env.ANALYTICS_ID,
}));
```

## Error Handling

Loaders should handle errors gracefully:

```typescript
import { loader } from '@hidrajs/loader';

export default loader(async () => {
	try {
		const response = await fetch('https://api.example.com/data');
		if (!response.ok) {
			throw new Error('Failed to fetch data');
		}
		return await response.json();
	} catch (error) {
		console.error('Error loading data:', error);
		return { error: 'Unable to load data' };
	}
});
```

## Type Safety

Use TypeScript for type-safe loaders:

```typescript
// src/types.ts
export interface Post {
	title: string;
	content: string;
	slug: string;
}

export interface BlogData {
	posts: Post[];
}

// src/pages/blog.data.ts
import { loader } from '@hidrajs/loader';
import type { BlogData } from '../../types';

export default loader(async (): Promise<BlogData> => {
	const response = await fetch('https://api.example.com/posts');
	const posts = await response.json();
	return { posts };
});
```

## See Also

- [Data Loading Guide](/guide/data)
- [Dynamic Routes Guide](/guide/dynamic-routes)
- [Global Data Guide](/guide/global)
