# Vite Plugin API

The Vite plugin integrates Handlebars templating with Vite's build pipeline.

## Installation

```bash
pnpm add -D @hidrajs/vite-plugin
```

## Usage

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import hidra from '@hidrajs/vite-plugin';

export default defineConfig({
	plugins: [hidra()],
});
```

## Configuration

The plugin accepts an optional configuration object:

```typescript
import { defineConfig } from 'vite';
import hidra from '@hidrajs/vite-plugin';

export default defineConfig({
	plugins: [
		hidra({
			global: 'src/global.ts',
			pages: {
				dir: 'src/pages',
			},
			layouts: {
				dir: 'src/layouts',
			},
			components: {
				dir: 'src/components',
			},
			helpers: {
				dir: 'src/helpers',
			},
		}),
	],
});
```

### Configuration Options

| Option           | Type     | Default            | Description                             |
| ---------------- | -------- | ------------------ | --------------------------------------- |
| `global`         | `string` | `'src/global.ts'`  | Path to global data file                |
| `pages.dir`      | `string` | `'src/pages'`      | Directory containing page templates     |
| `layouts.dir`    | `string` | `'src/layouts'`    | Directory containing layout templates   |
| `components.dir` | `string` | `'src/components'` | Directory containing component partials |
| `helpers.dir`    | `string` | `'src/helpers'`    | Directory containing custom helpers     |

## Features

### Virtual HTML Modules

The plugin generates virtual HTML modules that Vite can serve:

```
virtual:pages/index.html
virtual:pages/about.html
virtual:pages/blog/hello-world.html
```

### Hot Module Replacement

Changes to `.hbs` files trigger instant updates in the dev server.

### Smart Dependency Tracking

For dynamic routes, the plugin automatically tracks file dependencies:

```typescript
// src/pages/blog/[slug].data.ts
import { POSTS } from '@/libs/constants'; // ← Dependency tracked

export async function dynamic() {
	return POSTS.map((post) => ({
		params: { slug: post.slug },
		props: { title: post.title },
	}));
}
```

When you change `constants.ts`, only the affected dynamic pages are re-expanded. This provides:

- **Fast HMR** - No unnecessary re-expansion of unrelated pages
- **Precise invalidation** - Only pages depending on the changed file are updated
- **Automatic** - No configuration needed, dependencies are detected from imports

### TypeScript Support

Full TypeScript support for data loaders and helpers.

## Handlebars Helpers

The plugin registers built-in helpers:

### `{{layout}}`

Wraps content in a layout template.

```handlebars
{{#layout 'base'}}
	Content here
{{/layout}}
```

### `{{section}}`

Defines a named section of content.

```handlebars
{{#section 'title'}}Page Title{{/section}}
```

### `{{yield}}`

Outputs content from a section in a layout.

```handlebars
<title>{{yield 'title' 'Default Title'}}</title>
```

## Error Handling

The plugin throws descriptive errors for common issues:

- **LAYOUT_NOT_FOUND**: Referenced layout doesn't exist
- **CIRCULAR_LAYOUT**: Circular layout reference detected
- **MAX_LAYOUT_DEPTH**: Layout nesting exceeds maximum depth (5)
- **PAGE_CONFLICT**: Multiple pages resolve to the same output path
- **MISSING_DYNAMIC_DATA**: Dynamic route missing data file
- **INVALID_DYNAMIC_EXPORT**: Data file must export a `dynamic()` function

## Integration with Other Plugins

Works alongside other Vite plugins:

```typescript
import { defineConfig } from 'vite';
import hidra from '@hidrajs/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [
		hidra(),
		tailwindcss(),
		react(), // For any React components
	],
});
```

## Build Output

Running `vite build` generates static HTML files:

```
dist/
├── index.html
├── about.html
├── blog/
│   ├── index.html
│   └── hello-world/
│       └── index.html
└── assets/
    └── ...
```

## Dev Server

Running `vite` starts a dev server with HMR:

```bash
pnpm dev

# Server starts at http://localhost:5173
```

Access pages directly:

- `http://localhost:5173/` → index.hbs
- `http://localhost:5173/about` → about.hbs
- `http://localhost:5173/blog/hello-world` → blog/[slug].hbs

## Troubleshooting

### Layout Not Found

Ensure the layout file exists in `src/layouts/`:

```
src/layouts/base.hbs  ✓
```

```handlebars
{{#layout "base"}}  {{!-- References base.hbs --}}
```

### Page Conflict

Don't create conflicting routes:

```
src/pages/
├── about.hbs      ✗
└── about/
    └── index.hbs  ✗  (Both resolve to /about/)
```

Choose one pattern.

### Dynamic Route Issues

Ensure dynamic routes have both `.hbs` and `.data.ts` files:

```
src/pages/
└── blog/
    ├── [slug].hbs      ✓
    └── [slug].data.ts  ✓
```

## See Also

- [Loader API](/api/loader)
- [Guide](/guide/)
