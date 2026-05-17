import type { Author, Brand } from "../types";

/**
 * Publication identity for demo mode. Rebrand the template by editing this
 * file — no component changes needed. In live mode these values come from the
 * connected FavCRM workspace instead.
 */
export const brand: Brand = {
  name: "Offhours",
  tagline: "A field journal for people who make things.",
  description:
    "Offhours is an independent publication about craft, working habits, and the quiet decisions behind good work. New essays most weeks.",
  email: "hello@offhours.example",
  logoUrl: null,
  social: [
    { label: "RSS", href: "/blog" },
    { label: "Email", href: "mailto:hello@offhours.example" },
  ],
};

export const authors: Author[] = [
  {
    id: "author-mara",
    name: "Mara Ellison",
    role: "Editor",
    bio: "Writes about process, attention, and the economics of small creative work.",
    avatar: null,
  },
  {
    id: "author-theo",
    name: "Theo Park",
    role: "Contributor",
    bio: "Designer and occasional woodworker. Interested in tools that disappear.",
    avatar: null,
  },
];

export function getAuthor(id: string | null): Author | null {
  if (!id) return null;
  return authors.find((a) => a.id === id) ?? null;
}
