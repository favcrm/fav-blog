import { FavCRM } from "@favcrm/sdk";
import { requireLiveConfig } from "$lib/config";

/**
 * Construct an SDK client for the configured workspace. Only valid in live
 * mode — demo mode never touches the network (see `$lib/data/provider`).
 */
export function createFavCRM(fetchFn?: typeof globalThis.fetch): FavCRM {
  const { apiUrl, companyId } = requireLiveConfig();

  return new FavCRM({
    baseUrl: apiUrl,
    companyId,
    fetch: fetchFn,
  });
}
