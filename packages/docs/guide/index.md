# Introduction

Welcome to **Hidra** - a Vite plugin that brings the simplicity of Handlebars templating to modern multi-page applications.

## What is Hidra?

Hidra is a build-time framework that generates static HTML from Handlebars templates. It combines:

- **Vite** - Lightning-fast dev server and build tool
- **Handlebars** - Simple, logic-less templating
- **TypeScript** - Full type safety for your data loaders

## Why Choose Hidra?

### ⚡ Zero Runtime

Hidra generates pure static HTML at build time. No JavaScript framework runtime is needed in the browser.

### 🎨 Simple Templating

Handlebars provides a clean, readable syntax for templates without the complexity of JSX or Vue SFCs.

### 🔄 Dynamic Page Generation

Generate hundreds of pages from a single template using data files and dynamic routes.

### 🛠️ TypeScript Support

Write type-safe data loaders and custom helpers with full TypeScript support.

## Hello World Example

Here's a minimal Hidra app:

```
my-app/
├── src/
│   ├── layouts/
│   │   └── base.hbs
│   └── pages/
│       └── index.hbs
├── package.json
└── vite.config.ts
```

**src/layouts/base.hbs**

```handlebars
<html>
	<head>
		<title>{{yield 'title' 'My App'}}</title>
	</head>
	<body>
		{{yield 'content'}}
	</body>
</html>
```

**src/pages/index.hbs**

```handlebars
{{#layout 'base'}}
	{{#section 'title'}}Home{{/section}}
	{{#section 'content'}}
		<h1>Hello, World!</h1>
	{{/section}}
{{/layout}}
```

**vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import hidra from '@hidrajs/vite-plugin';

export default defineConfig({
	plugins: [hidra()],
});
```

Run `pnpm dev` and visit `http://localhost:5173` to see your app!

## Next Steps

- [Installation](/guide/installation) - Set up Hidra in your project
- [Project Structure](/guide/structure) - Understand the folder layout
- [Pages](/guide/pages) - Learn about page routing
