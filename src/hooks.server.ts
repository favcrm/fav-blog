/**
 * Server hook: resolve this blog deployment's FavCRM workspace from the
 * request hostname.
 *
 * Instead of every clone hard-coding a `VITE_FAVCRM_COMPANY_ID`, a deployment
 * registers its hostname in FavCRM (`storefront_domains` — done automatically
 * by `/setup`). The SDK's `createWorkspaceResolver` calls the public
 * resolve-domain endpoint, caches the result, and short-circuits local hosts.
 * The resolved `companyId` is stashed on `event.locals` for
 * `+layout.server.ts` and `+server.ts` routes to read.
 *
 * `VITE_FAVCRM_COMPANY_ID` remains the fallback when the hostname is not
 * registered (or for local dev). Demo mode is the default when neither
 * resolves.
 */
import type { Handle } from "@sveltejs/kit";
import { createWorkspaceResolver } from "@favcrm/sdk";
import { FAVCRM_API_URL, FAVCRM_COMPANY_ID } from "$lib/config";

const resolver = createWorkspaceResolver({ apiUrl: FAVCRM_API_URL });

export const handle: Handle = async ({ event, resolve }) => {
  const resolved = await resolver.resolve(event.url.hostname, event.fetch);
  event.locals.companyId = resolved ?? FAVCRM_COMPANY_ID ?? undefined;
  return resolve(event);
};
