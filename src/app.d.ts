declare global {
  namespace App {
    interface Locals {
      /** Workspace resolved from the request hostname (see hooks.server.ts). */
      companyId?: string;
    }
    interface PageData {
      tenant?: import("$lib/tenant").TenantConfig;
      companyId?: string;
    }
  }
}

export {};
