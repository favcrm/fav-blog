/**
 * Runtime configuration.
 *
 * The template runs in demo mode by default — built-in seed content, no
 * network. A workspace can be supplied two ways, in priority order:
 *
 *   1. Resolved at request time from the deployment's own hostname (a
 *      `storefront_domains` row registered in FavCRM — see `hooks.server.ts`).
 *      Threaded through the provider via `ProviderContext.companyId`.
 *   2. The `VITE_FAVCRM_COMPANY_ID` build-time env var — the fallback, mainly
 *      for local development.
 *
 * Either one switches the data provider to live `@favcrm/sdk` responses.
 */
export const FAVCRM_API_URL =
  (import.meta.env.VITE_FAVCRM_API_URL as string | undefined)?.replace(
    /\/$/,
    "",
  ) ?? "https://api.favcrm.io";

/** Build-time workspace UUID fallback. `undefined` in demo mode. */
export const FAVCRM_COMPANY_ID = (
  import.meta.env.VITE_FAVCRM_COMPANY_ID as string | undefined
)?.trim();

export const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") ??
  "";

/**
 * Per-request provider context, threaded as the last argument of every async
 * provider function by SvelteKit `load` functions.
 *
 * - `fetch` — the SvelteKit `event.fetch`, so SDK requests correlate with the
 *   render. Falls back to `globalThis.fetch` for client-side calls.
 * - `companyId` — the workspace resolved from the request hostname. Wins over
 *   the `VITE_FAVCRM_COMPANY_ID` env fallback.
 */
export type ProviderContext = {
  fetch?: typeof globalThis.fetch;
  companyId?: string;
};

/**
 * Resolve the effective workspace UUID for a request.
 * Hostname-resolved companyId wins; the env var is the fallback.
 */
export function resolveCompanyId(ctx?: ProviderContext): string | undefined {
  return ctx?.companyId?.trim() || FAVCRM_COMPANY_ID || undefined;
}

/** True once a non-empty workspace UUID is available for this request. */
export function isLive(ctx?: ProviderContext): boolean {
  return Boolean(resolveCompanyId(ctx));
}
