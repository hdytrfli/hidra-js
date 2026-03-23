# Layouts

Layouts are reusable templates that wrap your page content. They provide a consistent structure across your site.

## Creating a Layout

Create a `.hbs` file in `src/layouts/`:

```handlebars
{{! src/layouts/base.hbs }}

<html lang='en'>
	<head>
		<meta charset='UTF-8' />
		<meta name='viewport' content='width=device-width, initial-scale=1.0' />
		<title>{{yield 'title' 'My Site'}}</title>
	</head>
	<body>
		<header>
			<nav>
				<a href='/'>Home</a>
				<a href='/about'>About</a>
			</nav>
		</header>

		<main>
			{{yield 'content'}}
		</main>

		<footer>
			<p>&copy; 2026 My Site</p>
		</footer>
	</body>
</html>
```

## Using a Layout

Wrap your page content with the `{{#layout}}` helper:

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

## Yield with Fallbacks

Provide fallback values when sections are not defined:

```handlebars
{{! Default value }}
{{yield 'title' 'Default Title'}}

{{! Block fallback }}
{{#yield 'sidebar'}}

	<div>No sidebar content</div>
{{/yield}}
```

## Nested Layouts

Layouts can extend other layouts for more complex structures:

```handlebars
{{! src/layouts/admin.hbs }}
{{#layout 'base'}}
	{{#section 'admin-nav'}}
		<nav class='admin-nav'>
			<a href='/admin'>Dashboard</a>
			<a href='/admin/users'>Users</a>
		</nav>
	{{/section}}
	{{#section 'content'}}
		{{yield 'admin-content'}}
	{{/section}}
{{/layout}}
```

```handlebars
{{! src/pages/admin/dashboard.hbs }}
{{#layout 'admin'}}
	{{#section 'admin-content'}}
		<h1>Dashboard</h1>
		<p>Welcome to the admin dashboard!</p>
	{{/section}}
{{/layout}}
```

## Layout Caching

Hidra caches layouts in memory for fast rendering. Layouts are read once and reused across all pages.

## Layout Chain Detection

Hidra detects circular layout references and throws an error:

```handlebars
{{! This will throw an error }}
{{! layout-a.hbs }}
{{#layout 'layout-b'}}...{{/layout}}

{{! layout-b.hbs }}
{{#layout 'layout-a'}}...{{/layout}}
```

Maximum layout depth is 5 to prevent infinite nesting.

## Best Practices

### 1. Use Descriptive Section Names

```handlebars
{{! Good }}
{{yield 'page-title'}}
{{yield 'main-content'}}
{{yield 'sidebar'}}

{{! Less clear }}
{{yield 'title'}}
{{yield 'content'}}
{{yield 'side'}}
```

### 2. Provide Sensible Defaults

```handlebars
<title>{{yield 'title' site}}</title>
```

### 3. Keep Layouts Focused

Each layout should have a single responsibility. Create multiple layouts for different page types:

```
src/layouts/
├── base.hbs       # Main site layout
├── admin.hbs      # Admin dashboard layout
├── landing.hbs    # Marketing pages
└── minimal.hbs    # Simple pages
```

## Next Steps

- [Components](/guide/components) - Build reusable partials
- [Data Loading](/guide/data) - Load data for your pages
- [Global Data](/guide/global) - Share data across all pages
