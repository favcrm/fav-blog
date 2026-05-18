import { fetchTenantConfig } from "$lib/tenant";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ fetch, parent }) => {
  const { companyId } = await parent();
  // Never throws — demo mode and an unreachable workspace both resolve to a
  // usable brand identity (see `fetchTenantConfig`).
  const tenant = await fetchTenantConfig({ fetch, companyId });
  return { tenant };
};
