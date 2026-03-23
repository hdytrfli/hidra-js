# Custom Helpers

Custom helpers let you extend Handlebars with your own functionality.

## Creating a Helper

Create a TypeScript file in `src/helpers/`:

```typescript
// src/helpers/shout.ts
export default (text: string): string => text.toUpperCase();
```

Helpers are simple functions that receive arguments and return a result.

## Using Helpers in Templates

```handlebars
{{! src/pages/index.hbs }}
<h1>{{shout 'welcome to hidra'}}</h1>
<!-- Renders: WELCOME TO HIDRA -->
```

## Helper Examples

### Shout Helper

```typescript
// src/helpers/shout.ts
export default (text: string): string => text.toUpperCase();
```

```handlebars
{{shout 'hello'}}
<!-- Renders: HELLO -->
```

### JSON Helper

```typescript
// src/helpers/json.ts
export default (object: unknown): string => JSON.stringify(object, null, 2);
```

```handlebars
<pre>{{json data}}</pre>
```

### Markdown Helper

```typescript
// src/helpers/markdown.ts
import { marked } from 'marked';

export default (text: string): string => marked.parse(text) as string;
```

```handlebars
{{{markdown post.content}}}
<!-- Use triple braces to render HTML without escaping -->
```

### Truncate Helper

```typescript
// src/helpers/truncate.ts
export default (text: string, length: number = 100): string => {
	if (!text) return '';
	if (text.length <= length) return text;
	return text.slice(0, length) + '...';
};
```

```handlebars
{{truncate post.excerpt 50}}
```

### Pluralize Helper

```typescript
// src/helpers/pluralize.ts
export default (count: number, singular: string, plural?: string): string => {
	if (count === 1) return singular;
	return plural || singular + 's';
};
```

```handlebars
{{pluralize comments.length 'comment' 'comments'}}
<!-- "1 comment" or "5 comments" -->
```

### Format Date Helper

```typescript
// src/helpers/format-date.ts
export default (date: string | Date): string => {
	return new Date(date).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
};
```

```handlebars
{{format-date post.date}}
<!-- "March 22, 2026" -->
```

### Compare Helper (Block Helper)

Block helpers receive `HelperOptions` to access the block content:

```typescript
// src/helpers/compare.ts
import type { HelperOptions } from 'handlebars';

export default (a: unknown, operator: string, b: unknown, options: HelperOptions): string => {
	const operators: Record<string, boolean> = {
		'==': a == b,
		'===': a === b,
		'!=': a != b,
		'!==': a !== b,
		'<': a < b,
		'<=': a <= b,
		'>': a > b,
		'>=': a >= b,
	};

	return operators[operator] ? options.fn(this) : options.inverse(this);
};
```

```handlebars
{{#compare score '>=' 50}}
	<p>Pass!</p>
{{else}}
	<p>Fail!</p>
{{/compare}}
```

### With Helper (Block Helper)

```typescript
// src/helpers/with-author.ts
import type { HelperOptions } from 'handlebars';

export default (authorId: string, options: HelperOptions): string => {
	// Fetch author data
	const author = getAuthor(authorId);

	// Render block with author context
	return options.fn(author);
};
```

```handlebars
{{#with-author post.authorId}}
	<p>By {{name}} ({{email}})</p>
{{/with-author}}
```

## Registering Helpers

Hidra automatically registers helpers from `src/helpers/`. Each file should export a default function.

## Best Practices

### 1. Keep Helpers Simple

Helpers should do one thing well. Complex logic belongs in data loaders.

```typescript
// Good - simple transformation
export default (text: string): string => text.toUpperCase();

// Bad - too complex, move to loader
export default async (postId: string): Promise<Post> => {
	const response = await fetch(`/api/posts/${postId}`);
	return response.json();
};
```

### 2. Handle Edge Cases

```typescript
// Handle null/undefined
export default (text: string | null | undefined, length: number = 100): string => {
	if (!text) return '';
	if (text.length <= length) return text;
	return text.slice(0, length) + '...';
};
```

### 3. Use TypeScript

Type your helpers for better DX:

```typescript
export default (text: string, length?: number): string => {
	// Implementation
};
```

### 4. Document Your Helpers

```typescript
/**
 * Truncates text to a specified length.
 * @param text - The text to truncate
 * @param length - Maximum length (default: 100)
 * @returns Truncated text with ellipsis
 */
export default (text: string, length?: number): string => {
	// ...
};
```

## Next Steps

- [Global Data](/guide/global) - Share data across all pages
