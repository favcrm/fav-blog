import type { LayoutServerLoad } from "./$types";

/**
 * Expose the hostname-resolved workspace (`companyId`) to every page.
 *
 * `hooks.server.ts` resolves it from the request hostname; this load makes it
 * available to universal `+page.ts` / `+layout.ts` loads via `await parent()`
 * and to components via `$page.data.companyId`.
 */
export const load: LayoutServerLoad = ({ locals }) => ({
  companyId: locals.companyId,
});
