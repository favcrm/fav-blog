import type { BlogCategory } from "../types";

/** Seed categories for demo mode. */
export const categories: BlogCategory[] = [
  { id: "cat-craft", name: "Craft", slug: "craft" },
  { id: "cat-process", name: "Process", slug: "process" },
  { id: "cat-tools", name: "Tools", slug: "tools" },
  { id: "cat-field-notes", name: "Field Notes", slug: "field-notes" },
];

export function getCategory(slug: string): BlogCategory | undefined {
  return categories.find((c) => c.slug === slug);
}
