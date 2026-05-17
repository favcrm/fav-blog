declare global {
  namespace App {
    interface PageData {
      tenant?: import("$lib/tenant").TenantConfig;
    }
  }
}

export {};
