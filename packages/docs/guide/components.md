# Components

Components (also called partials) are reusable Handlebars templates that can be included in pages and layouts.

## Creating a Component

Create a `.hbs` file in `src/components/`:

::: code-group

```handlebars [src/components/button.hbs]
<a href="{{href}}" class="btn {{#if primary}}btn-primary{{else}}btn-secondary{{/if}}">
  {{label}}
</a>
```

:::

## Using a Component

Include components using the `{{> name}}` syntax:

```handlebars
{{!-- src/pages/index.hbs --}}
{{#layout "base"}}
  {{#section "content"}}
    <h1>Welcome</h1>
    {{> button label="Get Started" href="/signup" primary=true}}
    {{> button label="Learn More" href="/about"}}
  {{/section}}
{{/layout}}
```

## Passing Data to Components

Pass data as attributes when including the component:

```handlebars
{{> button label="Click Me" href="/page" primary=true disabled=false}}
```

Inside the component, access the data directly:

```handlebars
{{!-- src/components/button.hbs --}}
<button
  class="btn {{#if primary}}primary{{/if}}"
  {{#if disabled}}disabled{{/if}}
>
  {{label}}
</button>
```

## Component with Block Content

Components can accept block content using `{{>@partial-block}}`:

```handlebars
{{!-- src/components/card.hbs --}}
<div class="card">
  <div class="card-header">{{title}}</div>
  <div class="card-body">
    {{>@partial-block}}
  </div>
</div>
```

```handlebars
{{!-- Usage --}}
{{#> card title="Welcome"}}
  <p>This is the card content!</p>
  <p>It can have multiple paragraphs.</p>
{{/card}}
```

## Component Best Practices

### 1. Keep Components Small and Focused

```handlebars
{{! Good: Single responsibility }}
{{! src/components/avatar.hbs }}
<img src='{{src}}' alt='{{alt}}' class='avatar {{size}}' />

{{! Less focused }}
{{! src/components/user-profile.hbs }}
{{! Contains avatar, name, bio, social links... }}
```

### 2. Use Descriptive Names

```

src/components/
├── button.hbs
├── card.hbs
├── modal.hbs
├── navbar.hbs
├── footer.hbs
└── user-avatar.hbs

```

### 3. Document Component Props

Add comments to document expected props:

```handlebars
{{!--
  Button Component

  Props:
    - label: string - Button text
    - href: string - Link URL
    - primary: boolean - Use primary style
    - disabled: boolean - Disable button
--}}
<a href="{{href}}" class="btn {{#if primary}}primary{{/if}}">
  {{label}}
</a>
```

## Component Libraries

Organize components into subdirectories for larger projects:

```
src/components/
├── ui/
│   ├── button.hbs
│   ├── card.hbs
│   └── modal.hbs
├── layout/
│   ├── header.hbs
│   ├── footer.hbs
│   └── sidebar.hbs
└── forms/
    ├── input.hbs
    ├── select.hbs
    └── checkbox.hbs
```

```handlebars
{{> ui/button label="Submit" }}
{{> forms/input name="email" type="email" }}
```

## Next Steps

- [Data Loading](/guide/data) - Load data for your pages
- [Custom Helpers](/guide/helpers) - Create custom Handlebars helpers
