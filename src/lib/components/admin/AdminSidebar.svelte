<script lang="ts">
  import { page } from "$app/stores";
  import {
    LayoutDashboard,
    Tag,
    Users,
    Megaphone,
    Settings,
    X,
    FileText,
  } from "lucide-svelte";

  interface Props {
    isOpen: boolean;
    onClose: () => void;
  }

  let { isOpen, onClose }: Props = $props();

  interface NavItem {
    href: string;
    label: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    exact?: boolean;
  }

  interface NavGroup {
    label?: string;
    items: NavItem[];
  }

  const navGroups: NavGroup[] = [
    {
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      ],
    },
    {
      label: "Content",
      items: [
        { href: "/admin/blog", label: "Essays", icon: FileText },
        { href: "/admin/categories", label: "Categories", icon: Tag },
        { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
      ],
    },
    {
      label: "Audience",
      items: [
        { href: "/admin/customers", label: "Customers", icon: Users },
      ],
    },
    {
      items: [
        { href: "/admin/settings", label: "Settings", icon: Settings },
      ],
    },
  ];

  function isActiveRoute(href: string, exact = false): boolean {
    if (exact) return $page.url.pathname === href;
    return $page.url.pathname.startsWith(href);
  }
</script>

<!-- Mobile Overlay -->
{#if isOpen}
  <div
    class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
    onclick={onClose}
    onkeydown={(e) => e.key === "Escape" && onClose()}
    role="button"
    tabindex="0"
    aria-label="Close menu"
  ></div>
{/if}

<!-- Sidebar -->
<aside
  class="admin-sidebar {isOpen ? 'is-open' : ''}"
>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-slate-800">
      <span class="font-semibold text-sm text-white tracking-wide">Admin</span>
      <button
        onclick={onClose}
        class="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        aria-label="Close menu"
      >
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-3 space-y-4">
      {#each navGroups as group}
        <div>
          {#if group.label}
            <p class="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {group.label}
            </p>
          {/if}
          <div class="space-y-0.5">
            {#each group.items as item (item.href)}
              <a
                href={item.href}
                onclick={onClose}
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200"
                class:bg-slate-800={isActiveRoute(item.href, item.exact)}
                class:text-white={isActiveRoute(item.href, item.exact)}
                class:font-medium={isActiveRoute(item.href, item.exact)}
                class:text-slate-400={!isActiveRoute(item.href, item.exact)}
                class:hover:text-white={!isActiveRoute(item.href, item.exact)}
                class:hover:bg-slate-800={!isActiveRoute(item.href, item.exact)}
              >
                <item.icon class="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </a>
            {/each}
          </div>
        </div>
      {/each}
    </nav>

    <!-- Back to site -->
    <div class="p-3 border-t border-slate-800">
      <a
        href="/"
        class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 transition-colors"
      >
        &larr; Back to site
      </a>
    </div>
  </div>
</aside>

<style>
  .admin-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 50;
    width: 240px;
    height: 100vh;
    background: rgb(15 23 42);
    color: white;
    flex-shrink: 0;
    transform: translateX(-100%);
    transition: transform 240ms ease-out;
  }
  .admin-sidebar.is-open {
    transform: translateX(0);
  }
  @media (min-width: 1024px) {
    .admin-sidebar {
      position: sticky;
      top: 52px;
      z-index: auto;
      height: calc(100vh - 52px);
      transform: none;
      align-self: flex-start;
    }
  }
</style>
