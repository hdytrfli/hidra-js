# Pages

Pages are the heart of your Hidra application. Each `.hbs` file in `src/pages/` becomes a route in your site.

## Basic Pages

Create a file in `src/pages/` and it automatically becomes a route:

```
src/pages/
├── index.hbs      → /
├── about.hbs      → /about
└── contact.hbs    → /contact
```

```handlebars
{{! src/pages/about.hbs }}
<h1>About Us</h1>
<p>Welcome to our website!</p>
```

## Using Layouts

Wrap your page content in a layout using the <span v-pre>`{{#layout}}`</span> helper:

```handlebars
{{! src/pages/about.hbs }}
{{#layout 'base'}}
	Content goes here
{{/layout}}
```

## Using Sections

Sections let you inject content into specific parts of your layout:

```handlebars
{{! src/pages/about.hbs }}
{{#layout 'base'}}
	{{#section 'title'}}About Us{{/section}}
	{{#section 'content'}}
		<h1>About Us</h1>
		<p>Welcome to our website!</p>
	{{/section}}
{{/layout}}
```

```handlebars
{{! src/layouts/base.hbs }}
<html>
	<head>
		<title>{{yield 'title' 'My Site'}}</title>
	</head>
	<body>
		<main>
			{{yield 'content'}}
		</main>
	</body>
</html>
```

## Using Components (Partials)

Include reusable components using the `{{> component_name}}` syntax:

```handlebars
{{!-- src/pages/about.hbs --}}
{{#layout "base"}}
  {{#section "content"}}
    {{> header title="About"}}
    <main>
      <h1>About Us</h1>
    </main>
    {{> footer}}
  {{/section}}
{{/layout}}
```

## Using Helpers

Call custom helpers directly in your templates:

```handlebars
{{! src/pages/about.hbs }}
{{#layout 'base'}}
	{{#section 'content'}}
		<h1>{{shout 'About Us'}}</h1>
		<p>Today is {{format-date now}}</p>
	{{/section}}
{{/layout}}
```

## Page Data

Each page can optionally have a corresponding `.data.ts` file that provides data to the template:

```typescript
// src/pages/about.data.ts
import { loader } from '@hidrajs/loader';

export default loader(async () => ({
	title: 'About Us',
	team: ['Alice', 'Bob', 'Charlie'],
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
				<li>{{this}}</li>
			{{/each}}
		</ul>
	{{/section}}
{{/layout}}
```

### Accessing Page Data

Data from `.data.ts` files is available at the **root level** of your templates:

```handlebars
{{! Direct access - consistent DX for all pages }}
{{title}}
{{team}}

{{! Also available via page object }}
{{page.props.title}}
{{page.props.team}}
```

This provides a consistent experience whether you're using data loaders or not.

## Nested Routes

Create nested routes using subdirectories:

```
src/pages/
└── blog/
    ├── index.hbs      → /blog/
    ├── post-1.hbs     → /blog/post-1
    └── news/
        └── index.hbs  → /blog/news/
```

## Output Paths

Hidra automatically maps your file structure to output paths:

| File             | Output            |
| ---------------- | ----------------- |
| `index.hbs`      | `index.html`      |
| `about.hbs`      | `about.html`      |
| `blog/index.hbs` | `blog/index.html` |
| `blog/post.hbs`  | `blog/post.html`  |

## Conflict Detection

Hidra prevents routing conflicts. You cannot have both:

```
src/pages/
├── about.hbs         → about.html
└── about/
    └── index.hbs     → about/index.html → about/
```

Both would resolve to `/about/`, so Hidra throws an error. Choose one pattern.

## Next Steps

- [Layouts](/guide/layouts) - Create reusable page layouts
- [Data Loading](/guide/data) - Load data for your pages
- [Dynamic Routes](/guide/dynamic-routes) - Generate pages dynamically
