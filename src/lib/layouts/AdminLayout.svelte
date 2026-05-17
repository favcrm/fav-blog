<script lang="ts">
  import { page } from "$app/stores";
  import AdminSidebar from "$lib/components/admin/AdminSidebar.svelte";
  import { adminAuthStore, adminLogout } from "$lib/stores/admin-auth";
  import { Menu, LogOut } from "lucide-svelte";
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();

  let sidebarOpen = $state(false);

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  function closeSidebar() {
    sidebarOpen = false;
  }

  function handleLogout() {
    adminLogout();
    window.location.href = "/admin/login";
  }

  $effect(() => {
    $page.route.id;
    closeSidebar();
  });
</script>

<div class="admin-shell">
  <header class="admin-bar">
    <div class="admin-bar-left">
      <button
        onclick={toggleSidebar}
        class="admin-bar-menu lg:hidden"
        aria-label="Toggle menu"
      >
        <Menu class="w-5 h-5" />
      </button>
      <span class="text-sm font-medium text-gray-700">
        {$adminAuthStore.companyName ?? "Admin"}
      </span>
    </div>
    <div class="admin-bar-right">
      <span class="text-xs text-gray-500 hidden sm:inline">
        {$adminAuthStore.user?.email ?? ""}
      </span>
      <button
        onclick={handleLogout}
        class="admin-bar-logout"
      >
        <LogOut class="w-3.5 h-3.5" />
        <span class="hidden sm:inline">Logout</span>
      </button>
    </div>
  </header>

  <div class="admin-body">
    <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
    <main class="admin-main">
      <div class="p-4 sm:p-6 lg:p-8">
        {@render children()}
      </div>
    </main>
  </div>
</div>

<style>
  .admin-shell {
    min-height: 100vh;
    background: #f9fafb;
    display: flex;
    flex-direction: column;
  }

  .admin-bar {
    position: sticky;
    top: 0;
    z-index: 30;
    background: white;
    border-bottom: 1px solid #e5e7eb;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 52px;
    flex-shrink: 0;
  }

  .admin-bar-left,
  .admin-bar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .admin-bar-menu {
    padding: 6px;
    color: #6b7280;
    border-radius: 6px;
  }
  .admin-bar-menu:hover {
    color: #374151;
    background: #f3f4f6;
  }

  .admin-bar-logout {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    font-size: 12px;
    color: #4b5563;
    border-radius: 6px;
    transition: color 120ms, background 120ms;
  }
  .admin-bar-logout:hover {
    color: #dc2626;
    background: #fef2f2;
  }

  .admin-body {
    display: flex;
    flex: 1;
    min-height: 0;
  }

  .admin-main {
    flex: 1;
    min-width: 0;
  }
</style>
