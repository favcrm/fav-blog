<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { isAdminAuthenticated } from "$lib/stores/admin-auth";
  import AdminLayout from "$lib/layouts/AdminLayout.svelte";
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();

  let isLoginPage = $derived($page.url.pathname.startsWith("/admin/login"));

  $effect(() => {
    if (browser && !$isAdminAuthenticated && !isLoginPage) {
      goto("/admin/login");
    }
  });
</script>

{#if isLoginPage}
  {@render children()}
{:else if $isAdminAuthenticated}
  <AdminLayout>{@render children()}</AdminLayout>
{/if}
