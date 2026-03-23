# Dynamic Routes

Dynamic routes let you generate multiple pages from a single template using data files.

## Creating a Dynamic Route

Use square brackets in the filename to create a dynamic segment:

```
src/pages/
└── blog/
    ├── [slug].hbs       → Dynamic route
    └── [slug].data.ts   → Data loader (required for dynamic routes)
```

## Dynamic Data Loader

Dynamic routes use a `dynamic()` export that returns an array of route definitions:

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

### How It Works

1. **`dynamic()`** returns an array of route definitions with `params` and `props`
2. Hidra generates a page for each entry
3. Data from `props` is available at the root level in your template

### No Separate Loader Needed

All data for dynamic routes comes from the `props` returned by `dynamic()`. There's no separate `loader()` call - everything is defined in one place:

```typescript
// src/pages/blog/[slug].data.ts
import { dynamic } from '@hidrajs/loader';

export default dynamic(async () => {
	const response = await fetch('https://api.example.com/posts');
	const posts = await response.json();

	return posts.map((post) => ({
		params: { slug: post.slug },
		props: {
			title: post.title,
			content: post.content,
			date: post.date,
		},
	}));
});
```

### Return Type

The `dynamic()` function must return an array of objects with this shape:

```typescript
interface DynamicRouteEntry {
	params: Record<string, string>; // Route parameters
	props?: Record<string, unknown>; // Optional data passed to template
}
```

### Generating Routes from Data

Fetch dynamic routes from an API:

```typescript
// src/pages/blog/[slug].data.ts
import { dynamic } from '@hidrajs/loader';

export default dynamic(async () => {
	const response = await fetch('https://api.example.com/posts');
	const posts = await response.json();

	return posts.map((post) => ({
		params: { slug: post.slug },
		props: {
			title: post.title,
			excerpt: post.excerpt,
			date: post.date,
		},
	}));
});
```

### Loading from External Files

Import data from constants or other files:

```typescript
// src/pages/blog/[slug].data.ts
import { dynamic } from '@hidrajs/loader';
import { POSTS } from '@/libs/constants';

export default dynamic(async () => {
	return POSTS.map((post) => ({
		params: { slug: post.slug },
		props: {
			title: post.title,
			date: post.date,
		},
	}));
});
```

**Hot Module Replacement:** When you change imported files (like `constants.ts`), Hidra automatically re-expands the affected dynamic pages.

## Using Params in Templates

Access dynamic params and props in your template:

```handlebars
{{! src/pages/blog/[slug].hbs }}
{{#layout 'base'}}
	{{#section 'title'}}{{title}}{{/section}}
	{{#section 'content'}}
		<article>
			{{! From dynamic() props }}
			<h1>{{title}}</h1>
			<p class='excerpt'>{{excerpt}}</p>
			<small>Published: {{date}}</small>

			{{! Page metadata }}
			<small>Slug: {{page.params.slug}}</small>
			<small>URL: {{page.url}}</small>
		</article>
	{{/section}}
{{/layout}}
```

**Note:** Props from `dynamic()` are available at the root level (`{{title}}`), not under `{{page.props.title}}`.

## Multiple Dynamic Segments

You can have multiple dynamic segments in a path:

```
src/pages/
└── blog/
    └── [category]/
        └── [slug].hbs    → /blog/tech/hello-world
```

```typescript
// src/pages/blog/[category]/[slug].data.ts
import { dynamic } from '@hidrajs/loader';

export default dynamic(async () => {
	return [
		{
			params: { category: 'tech', slug: 'hello-world' },
			props: { title: 'Hello World' },
		},
		{
			params: { category: 'tech', slug: 'typescript-tips' },
			props: { title: 'TypeScript Tips' },
		},
		{
			params: { category: 'life', slug: 'my-journey' },
			props: { title: 'My Journey' },
		},
	];
});
```

## Generating Paths from Data

Fetch dynamic paths from an API:

```typescript
// src/pages/blog/[slug].data.ts
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

## Static Paths Fallback

Provide fallback paths for development:

```typescript
// src/pages/blog/[slug].data.ts
import { dynamic } from '@hidrajs/loader';

export default dynamic(async () => {
	try {
		const response = await fetch('https://api.example.com/posts');
		const posts = await response.json();
		return posts.map((post) => ({
			params: { slug: post.slug },
			props: { title: post.title },
		}));
	} catch {
		// Fallback for development
		return [
			{ params: { slug: 'hello-world' }, props: { title: 'Hello World' } },
			{ params: { slug: 'sample-post' }, props: { title: 'Sample Post' } },
		];
	}
});
```

## Generated Output

For a dynamic route `blog/[slug].hbs` with slugs `['hello', 'world']`:

```
dist/
└── blog/
    ├── hello/
    │   └── index.html
    └── world/
        └── index.html
```

## Best Practices

### 1. Handle Missing Data

```typescript
import { dynamic } from '@hidrajs/loader';

export default dynamic(async () => {
	const posts = await fetchPosts();

	if (posts.length === 0) {
		throw new Error('No posts available');
	}

	return posts.map((post) => ({
		params: { slug: post.slug },
		props: { title: post.title },
	}));
});
```

### 2. Cache External API Calls

```typescript
let cachedPosts: any[] | null = null;

export default dynamic(async () => {
	if (!cachedPosts) {
		const response = await fetch('https://api.example.com/posts');
		cachedPosts = await response.json();
	}

	return cachedPosts.map((post) => ({
		params: { slug: post.slug },
		props: { title: post.title },
	}));
});
```

### 3. Use External Files for Static Data

For data that doesn't change often, import from a constants file:

```typescript
// src/libs/constants.ts
export const POSTS = [
	{ slug: 'hello-world', title: 'Hello World' },
	{ slug: 'second-post', title: 'Second Post' },
];
```

```typescript
// src/pages/blog/[slug].data.ts
import { dynamic } from '@hidrajs/loader';
import { POSTS } from '@/libs/constants';

export default dynamic(async () => {
	return POSTS.map((post) => ({
		params: { slug: post.slug },
		props: { title: post.title },
	}));
});
```

**HMR Tip:** When you update `constants.ts`, Hidra automatically re-expands only the affected dynamic pages.

## Type Safety with Zod

For dynamic routes, use Zod to validate data at runtime. This is crucial because invalid data could break page generation:

```typescript
// src/schemas.ts
import { z } from 'zod';

export const PostSchema = z.object({
	slug: z.string(),
	title: z.string(),
	excerpt: z.string().optional(),
	date: z.string(),
});

export type Post = z.infer<typeof PostSchema>;
```

```typescript
// src/pages/blog/[slug].data.ts
import { dynamic } from '@hidrajs/loader';
import { PostSchema } from '../../schemas';

export default dynamic(async () => {
	const response = await fetch('https://api.example.com/posts');
	const data = await response.json();

	// Validate the API response
	const posts = z.array(PostSchema).parse(data);

	return posts.map((post) => ({
		params: { slug: post.slug },
		props: {
			title: post.title,
			excerpt: post.excerpt,
			date: post.date,
		},
	}));
});
```

### Handling Validation Errors

```typescript
import { dynamic } from '@hidrajs/loader';
import { PostSchema } from '../../schemas';

export default dynamic(async () => {
	try {
		const response = await fetch('https://api.example.com/posts');
		const data = await response.json();
		const posts = z.array(PostSchema).parse(data);
		return posts.map((post) => ({
			params: { slug: post.slug },
			props: { title: post.title },
		}));
	} catch (error) {
		if (error instanceof z.ZodError) {
			console.error('Validation error:', error.errors);
			return [
				{
					params: { slug: 'hello' },
					props: { title: 'Hello' },
				},
			];
		}

		throw error;
	}
});
```

### Safe Parsing

Use `safeParse()` for more control:

```typescript
const result = PostSchema.safeParse(data);

if (!result.success) {
	console.error('Invalid post data:', result.error.errors);
	return []; // Return empty array or fallback
}

// result.data is properly typed
const posts = result.data;
```

### Why Runtime Validation?

TypeScript types are compile-time only. Zod provides **runtime validation** which is essential for:

- **External API data** - Validate data from APIs at runtime
- **Page generation safety** - Prevent broken pages from invalid data
- **Clear error messages** - Know exactly what data is wrong
- **Type inference** - Automatically infer TypeScript types from schemas

## Next Steps

- [Custom Helpers](/guide/helpers) - Create custom Handlebars helpers
- [Global Data](/guide/global) - Share data across all pages
