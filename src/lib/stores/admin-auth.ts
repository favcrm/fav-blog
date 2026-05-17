import { writable, derived, get } from "svelte/store";
import { browser } from "$app/environment";
import type { AdminUser } from "$lib/types/admin";

const STORAGE_KEY = "favCRM_admin_auth";

export interface AdminAuthState {
  jwt: string | null;
  refreshToken: string | null;
  user: AdminUser | null;
  companyName: string | null;
}

const emptyState: AdminAuthState = {
  jwt: null,
  refreshToken: null,
  user: null,
  companyName: null,
};

function loadFromStorage(): AdminAuthState {
  if (!browser) return emptyState;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return emptyState;
    return { ...emptyState, ...JSON.parse(saved) };
  } catch {
    return emptyState;
  }
}

function saveToStorage(state: AdminAuthState) {
  if (!browser) return;
  try {
    if (state.jwt) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export const adminAuthStore = writable<AdminAuthState>(loadFromStorage());
adminAuthStore.subscribe(saveToStorage);

export const isAdminAuthenticated = derived(
  adminAuthStore,
  ($auth) => $auth.jwt !== null,
);

export const adminUser = derived(adminAuthStore, ($auth) => $auth.user);

export function adminLogin(data: {
  jwt: string;
  refreshToken: string;
  user: AdminUser;
  companyName: string;
}) {
  adminAuthStore.set({
    jwt: data.jwt,
    refreshToken: data.refreshToken,
    user: data.user,
    companyName: data.companyName,
  });
}

export function adminLogout() {
  adminAuthStore.set(emptyState);
}

export function getAdminToken(): string | null {
  return get(adminAuthStore).jwt;
}
