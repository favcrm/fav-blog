import { FavCRM } from "@favcrm/sdk";
import {
  FAVCRM_API_URL,
  resolveCompanyId,
  type ProviderContext,
} from "$lib/config";

/**
 * Construct an SDK client for the request's resolved workspace. Only valid in
 * live mode — demo mode never touches the network (see `$lib/data/provider`).
 * The workspace is resolved per request (hostname wins, env var is fallback).
 */
export function createFavCRM(ctx?: ProviderContext): FavCRM {
  const companyId = resolveCompanyId(ctx);
  if (!companyId) {
    throw new Error(
      "createFavCRM() called without a resolved workspace — live mode requires a companyId.",
    );
  }
  return new FavCRM({
    baseUrl: FAVCRM_API_URL,
    companyId,
    fetch: ctx?.fetch,
  });
}
