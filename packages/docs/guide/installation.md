# Installation

## Using the CLI

The easiest way to get started is using the create-hidra CLI:

```bash
pnpm create hidra@latest my-app
cd my-app
pnpm install
pnpm dev
```

## Manual Installation

1. Create a new directory and initialize a project:

```bash
mkdir my-app && cd my-app
pnpm init
```

2. Install dependencies:

```bash
pnpm add @hidrajs/loader
pnpm add -D @hidrajs/vite-plugin vite tailwindcss @tailwindcss/vite typescript
```

3. Create your project structure:

```
my-app/
├── src/
│   ├── pages/
│   ├── layouts/
│   ├── components/
│   ├── helpers/
│   ├── assets/
│   └── global.ts
├── vite.config.ts
└── tsconfig.json
```

4. Configure Vite:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import hidra from '@hidrajs/vite-plugin';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [hidra(), tailwindcss()],
	resolve: {
		alias: { '@': '/src' },
	},
});
```
