import type { PageMeta, DynamicEntry } from '@/types';
export type { PageMeta, DynamicEntry };

/**
 * Wraps a global data loader function.
 * Runs once before any page is rendered.
 * Return value is merged into every page's template context.
 */
export const root = <T>(fn: () => Promise<T>): typeof fn => fn;

/**
 * Wraps a per-page data loader function.
 * Receives page metadata and returns data for the template.
 * Return value becomes page.props in the template.
 */
export const loader = <T>(fn: (ctx: { page: PageMeta }) => Promise<T>): typeof fn => fn;

/**
 * Wraps a dynamic route expander function.
 * Each returned entry produces one HTML page.
 */
export const dynamic = (fn: () => Promise<DynamicEntry[]>): typeof fn => fn;
