# fav-blog — FavCRM Blog Template

A production-grade **blog / publication website** template, built on
[SvelteKit](https://kit.svelte.dev) and styled with an editorial field-journal
aesthetic. It uses a FavCRM workspace as a headless CMS through
[`@favcrm/sdk`](https://www.npmjs.com/package/@favcrm/sdk).

It is designed to be **deployed by anyone, with zero configuration**. Clone it,
push it to Vercel, and you get a complete, working blog running on built-in demo
essays. Connect a FavCRM workspace later to publish your own.

---

## Deploy in one click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/favcrm/fav-blog)

No environment variables are required. The site ships with seed essays,
categories and authors — it just works.

> This is a **GitHub template repository**. Click **"Use this template"** to
> create your own copy, then deploy that.

## Run locally

```bash
pnpm install
pnpm dev
```

Open <http://localhost:5173>. That is the whole setup.

## Modes

| Mode               | When                         | Data source                          |
| ------------------ | ---------------------------- | ------------------------------------ |
| **Demo** (default) | No env vars set              | Seed content in `src/lib/data/mock/` |
| **Live**           | `VITE_FAVCRM_COMPANY_ID` set | `@favcrm/sdk` against your workspace |

Every route loader talks only to `src/lib/data/provider.ts`. Demo mode and live
mode share the same provider functions, so the UI never branches on mode.

## Going live — `/setup`

Visit **`/setup`** on the running site to register a free FavCRM workspace
without leaving the page:

1. Enter your email — a 6-digit code is sent to confirm it.
2. Verify the code — a workspace is created and you receive its ID.
3. Add `VITE_FAVCRM_COMPANY_ID=<id>` to your Vercel project's environment
   variables and redeploy.

The workspace starts on the free plan. Upgrade for more posts, custom domains
and analytics from the FavCRM billing dashboard at
[app.favcrm.io](https://app.favcrm.io/settings/billing).

Registration uses the public developer endpoints `POST /v6/dev/signup` and
`POST /v6/dev/verify` (see `src/routes/(site)/setup/+page.server.ts`).

## Admin — `/admin`

The template includes a merchant admin at `/admin`, behind an email + password
login. Use it to manage essays, categories, subscribers, announcements and
settings. It calls the authenticated FavCRM merchant API (`/v6/merchant/*`) and
requires a connected workspace.

## Make it yours

Everything needed to rebrand the demo lives in a few files — no component edits
required.

| What                           | Where                             |
| ------------------------------ | --------------------------------- |
| Publication name, tagline, bio | `src/lib/data/mock/brand.ts`      |
| Authors / masthead             | `src/lib/data/mock/brand.ts`      |
| Categories                     | `src/lib/data/mock/categories.ts` |
| Demo essays (typed blocks)     | `src/lib/data/mock/posts.ts`      |
| Colours, fonts                 | `src/app.css`, `src/app.html`     |

In live mode, the publication identity and posts come from the connected FavCRM
workspace instead.

## What's included

- **Home** — editorial masthead, featured essay, recent essays
- **Essays** (`/blog`) — archive with category filter and pagination
- **Article** (`/blog/[slug]`) — typed content-block renderer, byline, related
  essays, `BlogPosting` JSON-LD
- **About / Contact / Privacy / Terms** — publication pages
- **Setup** (`/setup`) — in-app workspace registration
- **Admin** (`/admin`) — essay, category, subscriber and announcement management
- **SEO** — `sitemap.xml`, `robots.txt`, `/llms.txt`, and per-essay
  `/blog/[slug]/llms.txt` Markdown views for AI crawlers

## Content blocks

Essays store content as a typed block array (`BlogPost.blocks`, a JSON string).
`src/lib/components/site/BlockContent.svelte` renders paragraphs, headings,
lists, quotes, callouts, code, images, embeds and more. Unknown block types are
skipped, per the SDK forward-compatibility contract.

## Environment variables (optional)

See `.env.example`. All are optional; unset means demo mode.

| Variable                 | Purpose                                                 |
| ------------------------ | ------------------------------------------------------- |
| `VITE_FAVCRM_COMPANY_ID` | Workspace UUID. Setting it switches to live mode.       |
| `VITE_FAVCRM_API_URL`    | Defaults to `https://api.favcrm.io`.                    |
| `VITE_SITE_URL`          | Public site URL, used for SEO metadata and the sitemap. |

## Tech

SvelteKit 2 · Svelte 5 · Tailwind CSS 3 · TypeScript · `@favcrm/sdk` ·
`@sveltejs/adapter-vercel`

```bash
pnpm check   # type-check
pnpm lint    # lint + format check
pnpm build   # production build
```

---

Built for the FavCRM headless platform.
