import { fetchTenantConfig } from "$lib/tenant";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ fetch }) => {
  // Never throws — demo mode and an unreachable workspace both resolve to a
  // usable brand identity (see `fetchTenantConfig`).
  const tenant = await fetchTenantConfig(fetch);
  return { tenant };
};
