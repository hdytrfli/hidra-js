# Project Structure

Hidra uses a convention-based folder structure that makes it easy to organize your project.

## Recommended Structure

```
my-app/
├── src/
│   ├── pages/           # Your Handlebars page templates
│   │   ├── index.hbs
│   │   ├── about.hbs
│   │   └── blog/
│   │       ├── index.hbs
│   │       └── [slug].hbs
│   │
│   ├── layouts/         # Layout templates
│   │   └── base.hbs
│   │
│   ├── components/      # Reusable partials
│   │   ├── header.hbs
│   │   ├── footer.hbs
│   │   └── button.hbs
│   │
│   ├── helpers/         # Custom Handlebars helpers
│   │   └── format-date.ts
│   │
│   ├── assets/          # Static assets
│   │   ├── main.css
│   │   └── main.ts
│   │
│   └── global.ts        # Global data for all pages
│
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── package.json
```

## Folder Descriptions

### `src/pages/`

Contains your Handlebars page templates. Each `.hbs` file becomes a route in your application.

- `index.hbs` → `/`
- `about.hbs` → `/about`
- `blog/index.hbs` → `/blog/`
- `blog/[slug].hbs` → `/blog/:slug` (dynamic route)

### `src/layouts/`

Contains layout templates that wrap your page content. Layouts use <span v-pre>`{{yield}}`</span> to inject content from pages.

### `src/components/`

Reusable Handlebars partials that can be included in pages and layouts using <span v-pre>`{{> component_name}}`</span>.

### `src/helpers/`

Custom Handlebars helpers written in TypeScript. Export a default function that registers your helper.

### `src/assets/`

Static assets like CSS, JavaScript, images, and fonts. These are processed by Vite.

### `src/global.ts`

Exports global data that's available to all pages and layouts. Use the `root()` function from `@hidrajs/loader`.

## File Naming Conventions

| Pattern               | Description           | Example               |
| --------------------- | --------------------- | --------------------- |
| `*.hbs`               | Page template         | `about.hbs`           |
| `[name].hbs`          | Dynamic route         | `[slug].hbs`          |
| `_*.hbs`              | Partial (not a route) | `_header.hbs`         |
| `*.data.ts`           | Page data loader      | `about.data.ts`       |
| `*.data.ts` (dynamic) | Dynamic route data    | `blog/[slug].data.ts` |

## Configuration Files

### `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import hidra from '@hidrajs/vite-plugin';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [hidra(), tailwindcss()],
	resolve: {
		alias: {
			'@': '/src',
		},
	},
});
```

### `tsconfig.json`

```json
{
	"compilerOptions": {
		"target": "ES2020",
		"module": "ESNext",
		"moduleResolution": "bundler",
		"strict": true,
		"esModuleInterop": true,
		"skipLibCheck": true,
		"forceConsistentCasingInFileNames": true,
		"baseUrl": ".",
		"paths": {
			"@/*": ["src/*"]
		}
	}
}
```

## Next Steps

- [Pages](/guide/pages) - Learn about page templates and routing
- [Layouts](/guide/layouts) - Create reusable page layouts
- [Components](/guide/components) - Build reusable partials
