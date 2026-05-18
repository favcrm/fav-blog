/**
 * Site/brand configuration resolver.
 *
 * Demo mode: returns the publication identity from the seed `brand.ts`.
 * Live mode: reads brand fields from the connected FavCRM workspace, resolved
 * per request from the deployment hostname (or the env-var fallback).
 *
 * Either way the shape is the same, so the layout and pages never branch on
 * mode themselves.
 */
import { FAVCRM_API_URL, resolveCompanyId } from "$lib/config";
import type { ProviderContext } from "$lib/config";
import { unwrapApiResponse } from "$lib/api-envelope";
import { brand as demoBrand } from "$lib/data/mock/brand";

export interface TenantConfig {
  isLive: boolean;
  brandName: string;
  brandTagline: string;
  brandDescription: string;
  brandEmail: string;
  brandLogoUrl: string | null;
}

interface CacheEntry {
  config: TenantConfig;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const TTL_MS = 5 * 60 * 1000;

const demoConfig: TenantConfig = {
  isLive: false,
  brandName: demoBrand.name,
  brandTagline: demoBrand.tagline,
  brandDescription: demoBrand.description,
  brandEmail: demoBrand.email,
  brandLogoUrl: demoBrand.logoUrl,
};

export async function fetchTenantConfig(
  ctx?: ProviderContext,
): Promise<TenantConfig> {
  const companyId = resolveCompanyId(ctx);
  if (!companyId) return demoConfig;

  const cached = cache.get(companyId);
  if (cached && cached.expiresAt > Date.now()) return cached.config;

  const fetchFn = ctx?.fetch ?? globalThis.fetch;
  try {
    const res = await fetchFn(
      `${FAVCRM_API_URL}/v6/customer-portal/company/modules`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Company-Id": companyId,
        },
      },
    );
    if (!res.ok) throw new Error(`Tenant config request failed: ${res.status}`);

    const data = unwrapApiResponse<Record<string, unknown>>(await res.json());
    const config: TenantConfig = {
      isLive: true,
      brandName: String(data.brandName ?? data.name ?? demoBrand.name),
      brandTagline: String(data.brandTagline ?? demoBrand.tagline),
      brandDescription: String(
        data.brandDescription ?? data.description ?? demoBrand.description,
      ),
      brandEmail: String(data.brandEmail ?? data.email ?? demoBrand.email),
      brandLogoUrl: (data.brandLogoUrl ?? data.logoUrl ?? null) as
        | string
        | null,
    };
    cache.set(companyId, { config, expiresAt: Date.now() + TTL_MS });
    return config;
  } catch {
    // Live mode but the workspace is unreachable — fall back to demo identity
    // rather than blanking the whole site.
    return { ...demoConfig, isLive: true };
  }
}
