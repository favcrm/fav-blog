/**
 * Runtime configuration. Every value is optional — with nothing set the
 * template runs in demo mode against the built-in seed content. Set
 * VITE_FAVCRM_COMPANY_ID to connect a real FavCRM workspace (live mode).
 */
export const FAVCRM_API_URL =
  (import.meta.env.VITE_FAVCRM_API_URL as string | undefined)?.replace(
    /\/$/,
    "",
  ) ?? "https://api.favcrm.io";

export const FAVCRM_COMPANY_ID = (
  import.meta.env.VITE_FAVCRM_COMPANY_ID as string | undefined
)?.trim();

export const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") ??
  "";

/** Live mode = a workspace UUID is configured. Otherwise demo mode. */
export function isLiveMode(): boolean {
  return Boolean(FAVCRM_COMPANY_ID);
}

/** Resolved config for live-mode requests. Throws if called in demo mode. */
export function requireLiveConfig() {
  if (!FAVCRM_COMPANY_ID) {
    throw new Error("VITE_FAVCRM_COMPANY_ID is not configured");
  }
  return {
    apiUrl: FAVCRM_API_URL,
    companyId: FAVCRM_COMPANY_ID,
    siteUrl: SITE_URL,
  };
}
