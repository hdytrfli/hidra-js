# Global Data

Global data is shared across all pages and layouts in your application.

## Creating Global Data

Create `src/global.ts` (optional) and export a default function using `root()`:

```typescript
// src/global.ts
import { root } from '@hidrajs/loader';

export default root(async () => ({
	site: 'My Website',
	description: 'A wonderful website built with Hidra',
	year: new Date().getFullYear(),
	navigation: [
		{ label: 'Home', href: '/' },
		{ label: 'About', href: '/about' },
		{ label: 'Blog', href: '/blog' },
	],
}));
```

**Note:** The global data file is completely optional. If it doesn't exist, your app will work normally with just page-level data.

## Using Global Data

Global data is automatically merged with page data:

```handlebars
{{! src/layouts/base.hbs }}

<html>
	<head>
		<title>{{yield 'title' site}}</title>
		<meta name='description' content='{{description}}' />
	</head>
	<body>
		<header>
			<nav>
				{{#each navigation}}
					<a href='{{href}}'>{{label}}</a>
				{{/each}}
			</nav>
		</header>

		<main>
			{{yield 'content'}}
		</main>

		<footer>
			<p>&copy; {{year}} {{site}}</p>
			<div class='social'>
				<a href='{{social.twitter}}'>Twitter</a>
				<a href='{{social.github}}'>GitHub</a>
			</div>
		</footer>
	</body>
</html>
```

## Data Merging

Global data is merged with page data. Page data takes precedence:

```typescript
// src/global.ts
export default root(async () => ({
	site: 'My Site',
	title: 'Default Title',
}));

// src/pages/about.data.ts
export default loader(async () => ({
	title: 'About Us', // Overrides global title
	team: ['Alice', 'Bob'],
}));
```

```handlebars
{{! In about.hbs }}
{{site}}
<!-- "My Site" (from global) -->
{{title}}
<!-- "About Us" (from page, overrides global) -->
{{team}}
<!-- ["Alice", "Bob"] (from page) -->
```

## Async Global Data

Load global data asynchronously:

```typescript
// src/global.ts
import { root } from '@hidrajs/loader';

export default root(async () => {
	const [settings, navigation] = await Promise.all([
		fetch('https://api.example.com/settings').then((r) => r.json()),
		fetch('https://api.example.com/navigation').then((r) => r.json()),
	]);

	return {
		site: settings.name,
		navigation,
	};
});
```

## Environment Variables

Use environment variables in global data:

```typescript
// src/global.ts
import { root } from '@hidrajs/loader';

export default root(async () => ({
	site: 'My Site',
	isDev: process.env.NODE_ENV === 'development',
	analytics: process.env.ANALYTICS_ID,
	apiBaseUrl: process.env.API_BASE_URL,
}));
```

## Conditional Global Data

Return different data based on conditions:

```typescript
// src/global.ts
import { root } from '@hidrajs/loader';

export default root(async () => {
	return {
		site: 'My Site',
		analytics: process.env.NODE_ENV === 'development' ? null : process.env.ANALYTICS_ID,
		debug: isDev,
	};
});
```

```handlebars
{{#if debug}}
	<div class='debug-info'>Debug mode enabled</div>
{{/if}}

{{#if analytics}}
	<script>/* Analytics code */</script>
{{/if}}
```

## Next Steps

- [API Reference](/api/loader) - Learn about the Loader API
