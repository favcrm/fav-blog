import type { AnyBlock, BlogPost, BlogPostListItem } from "../types";
import { categories } from "./categories";

/**
 * Seed blog posts for demo mode. Each post carries typed content blocks,
 * serialized to the same JSON-string shape the FavCRM API returns on
 * `BlogPost.blocks`. Edit freely — or connect a workspace to replace it all.
 */

let blockSeq = 0;
function block<T extends AnyBlock["type"], D>(type: T, data: D): AnyBlock {
  return { id: `seed-${++blockSeq}`, type, version: 1, data } as AnyBlock;
}

const p = (html: string) => block("paragraph", { html });
const h = (level: 2 | 3, text: string) => block("heading", { level, text });

interface Seed {
  slug: string;
  title: string;
  excerpt: string;
  categorySlug: string;
  authorId: string;
  tags: string[];
  publishedAt: string;
  seoDescription: string;
  blocks: AnyBlock[];
}

const seeds: Seed[] = [
  {
    slug: "the-cost-of-a-clean-desk",
    title: "The cost of a clean desk",
    excerpt:
      "Tidiness is a tool, not a virtue. What a workspace optimises for says more than how it looks.",
    categorySlug: "process",
    authorId: "author-mara",
    tags: ["habits", "attention"],
    publishedAt: "2026-05-09T08:00:00.000Z",
    seoDescription:
      "Why an obsessively clean desk can quietly cost you the messy middle of good work.",
    blocks: [
      p(
        "There is a particular kind of person who cannot start until the desk is clear. I am that person, and I have spent years suspicious of it.",
      ),
      h(2, "Order as procrastination"),
      p(
        "A clean desk is a finished thing. Work is an unfinished thing. When the two compete, the desk usually wins, because it offers the small, complete satisfaction that the work withholds.",
      ),
      block("quote", {
        text: "Tidying is the cheapest possible imitation of progress.",
        cite: "a colleague, unkindly",
      }),
      h(2, "What to keep out"),
      p(
        "The fix is not a messier desk. It is deciding, in advance, which mess is allowed to stay:",
      ),
      block("list", {
        ordered: false,
        items: [
          "The current draft, open and visible",
          "One reference you keep returning to",
          "A single notebook, pen uncapped",
        ],
      }),
      block("callout", {
        tone: "note",
        title: "Try this",
        body: "End the day by clearing everything except the one object that represents tomorrow's first move.",
      }),
    ],
  },
  {
    slug: "tools-that-disappear",
    title: "Tools that disappear",
    excerpt:
      "The best instruments stop being noticeable. Here is how to tell whether yours have.",
    categorySlug: "tools",
    authorId: "author-theo",
    tags: ["tools", "design"],
    publishedAt: "2026-05-02T08:00:00.000Z",
    seoDescription:
      "A short test for whether the tools you use have become transparent to the work.",
    blocks: [
      p(
        "A good chisel is one you forget you are holding. The same is true of software, notebooks, and editing apps — though they fight much harder to be remembered.",
      ),
      h(2, "The transparency test"),
      p(
        "Ask: when you sit down to work, do you think about the tool before the task? If the answer is yes more than twice a week, the tool is in the way.",
      ),
      block("list", {
        ordered: true,
        items: [
          "It boots into the work, not into a menu.",
          "Its defaults are the choices you would have made anyway.",
          "You stopped reading its release notes a year ago.",
        ],
      }),
      block("callout", {
        tone: "warning",
        title: "A caution",
        body: "Disappearing is different from being basic. The tool can be deep — it just should not be loud.",
      }),
      p(
        "Most tool fatigue is not about features. It is about being asked to have an opinion too often.",
      ),
    ],
  },
  {
    slug: "notes-from-a-slow-week",
    title: "Notes from a slow week",
    excerpt:
      "Five small observations from a week where nothing shipped and that was fine.",
    categorySlug: "field-notes",
    authorId: "author-mara",
    tags: ["field-notes"],
    publishedAt: "2026-04-24T08:00:00.000Z",
    seoDescription:
      "Field notes from an unproductive week, and why the ledger looked wrong.",
    blocks: [
      p(
        "Nothing shipped this week. The instinct is to apologise for that. Instead, here is what the week actually contained.",
      ),
      block("list", {
        ordered: false,
        items: [
          "Three conversations that changed a plan before it cost anything.",
          "One long walk that solved a problem two weeks of sitting had not.",
          "A rejected idea, finally and cleanly buried.",
          "Reading — the kind that does not announce its usefulness.",
          "Rest, taken without negotiating for it.",
        ],
      }),
      block("quote", {
        text: "The ledger of a slow week is written in a currency the calendar cannot see.",
      }),
      p(
        "Output is easy to count, which is exactly why it gets counted too much.",
      ),
    ],
  },
  {
    slug: "the-second-draft-is-the-first-real-one",
    title: "The second draft is the first real one",
    excerpt:
      "First drafts exist to be wrong on paper. The work begins when you have something to argue with.",
    categorySlug: "craft",
    authorId: "author-mara",
    tags: ["writing", "process"],
    publishedAt: "2026-04-15T08:00:00.000Z",
    seoDescription:
      "Why treating the first draft as disposable makes the second draft possible.",
    blocks: [
      p(
        "The first draft is not a smaller version of the finished piece. It is a different object entirely — closer to a sketch of an argument than the argument itself.",
      ),
      h(2, "Permission to be wrong"),
      p(
        "Its only job is to be wrong somewhere visible. You cannot edit a thought; you can only edit a sentence. The first draft converts the former into the latter.",
      ),
      block("callout", {
        tone: "info",
        title: "Reframe",
        body: "Stop calling it a draft. Call it raw material. You would not be embarrassed by an unsanded board.",
      }),
      h(2, "Where the work is"),
      p(
        "The second draft is where you finally have something to disagree with. Disagreement is the engine. Without a draft, there is nothing to push against.",
      ),
    ],
  },
  {
    slug: "small-batches",
    title: "In praise of small batches",
    excerpt:
      "Shipping less, more often, changes more than your release notes. It changes what you dare to try.",
    categorySlug: "process",
    authorId: "author-theo",
    tags: ["process", "shipping"],
    publishedAt: "2026-04-06T08:00:00.000Z",
    seoDescription:
      "How small, frequent batches lower the cost of being wrong and raise the rate of learning.",
    blocks: [
      p(
        "A small batch is not just a small release. It is a smaller bet, and a smaller bet is one you can afford to lose.",
      ),
      block("quote", {
        text: "The size of your batch is the size of your courage.",
      }),
      h(2, "What gets cheaper"),
      block("list", {
        ordered: false,
        items: [
          "Being wrong — you find out in days, not quarters.",
          "Changing your mind — there is less sunk cost to defend.",
          "Starting — the next batch is always close.",
        ],
      }),
      p(
        "The hidden output of small batches is not the work. It is the willingness to try the uncertain thing, because the cost of trying has quietly collapsed.",
      ),
    ],
  },
  {
    slug: "what-a-walk-is-for",
    title: "What a walk is for",
    excerpt:
      "The walk is not a break from the work. For a certain kind of problem, the walk is the work.",
    categorySlug: "field-notes",
    authorId: "author-mara",
    tags: ["habits", "thinking"],
    publishedAt: "2026-03-28T08:00:00.000Z",
    seoDescription:
      "Why walking solves a specific class of problems that sitting at a desk cannot.",
    blocks: [
      p(
        "There is a class of problem that does not yield to effort. Push harder at the desk and it only digs in. These are problems of arrangement, not of force.",
      ),
      h(2, "Loosening, not solving"),
      p(
        "A walk does not solve such a problem directly. It loosens it. The body moving lets the mind stop gripping, and a loose problem can finally rotate.",
      ),
      block("callout", {
        tone: "success",
        title: "The rule",
        body: "If you have read the same paragraph three times, the next move is the door, not the chair.",
      }),
      p(
        "The walk is not idleness. It is a different posture for the same job.",
      ),
    ],
  },
];

function makePost(seed: Seed, index: number): BlogPost {
  const category = categories.find((c) => c.slug === seed.categorySlug)!;
  return {
    id: `seed-post-${index + 1}`,
    companyId: "demo",
    type: "post",
    slug: seed.slug,
    title: seed.title,
    excerpt: seed.excerpt,
    status: "published",
    visibility: "public",
    featuredImage: null,
    authorId: seed.authorId,
    parentId: null,
    sortOrder: index,
    publishedAt: seed.publishedAt,
    createdAt: seed.publishedAt,
    updatedAt: seed.publishedAt,
    categories: [category],
    tags: seed.tags.map((name) => ({
      id: `tag-${name}`,
      name,
      color: null,
    })),
    blocks: JSON.stringify(seed.blocks),
    seoTitle: seed.title,
    seoDescription: seed.seoDescription,
    meta: { authorId: seed.authorId },
  };
}

/** Full demo posts, newest first. */
export const posts: BlogPost[] = seeds
  .map(makePost)
  .sort((a, b) => (a.publishedAt! < b.publishedAt! ? 1 : -1));

/** List-view projection. `BlogPost` extends `BlogPostListItem`, so the full
 *  posts are already valid list items. */
export const postListItems: BlogPostListItem[] = posts;
