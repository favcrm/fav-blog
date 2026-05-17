<script lang="ts">
  import { onMount } from "svelte";
  import {
    FileText,
    CheckCircle2,
    PencilLine,
    Users,
    ArrowRight,
    Plus,
  } from "lucide-svelte";
  import { adminBlogApi, adminCustomersApi } from "$lib/api/admin";
  import type { BlogPostAdmin } from "$lib/types/admin";
  import { formatRelativeTime } from "$lib/utils/formatting";
  import StatusBadge from "$lib/components/admin/StatusBadge.svelte";
  import LoadingSkeleton from "$lib/components/ui/LoadingSkeleton.svelte";

  let posts = $state<BlogPostAdmin[]>([]);
  let total = $state(0);
  let customerCount = $state(0);
  let loading = $state(true);
  let error = $state("");

  const published = $derived(
    posts.filter((p) => p.status === "published").length,
  );
  const drafts = $derived(
    posts.filter((p) => p.status === "draft" || p.status === "scheduled")
      .length,
  );
  const recent = $derived(posts.slice(0, 6));

  onMount(async () => {
    try {
      const [postsRes, subsRes] = await Promise.all([
        adminBlogApi.list({ page: 1, pageSize: 100, ordering: "-updatedAt" }),
        adminCustomersApi.list({ page: 1, pageSize: 1 }).catch(() => null),
      ]);
      posts = postsRes.items;
      total = postsRes.total;
      customerCount = subsRes?.total ?? 0;
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load dashboard";
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head><title>Dashboard — Admin</title></svelte:head>

<div class="admin-page-header">
  <div>
    <h1>Dashboard</h1>
    <p>An overview of your publication.</p>
  </div>
  <a class="admin-primary-action" href="/admin/blog">
    <Plus size={15} strokeWidth={2} />
    Write an essay
  </a>
</div>

{#if loading}
  <LoadingSkeleton />
{:else if error}
  <div class="admin-empty-panel">
    <p>{error}</p>
  </div>
{:else}
  <div class="admin-metric-grid">
    <div class="admin-metric-card" data-tone="sky">
      <div>
        <span class="admin-metric-icon"><FileText size={18} /></span>
        <ArrowRight size={16} class="admin-card-arrow" />
      </div>
      <strong>{total}</strong>
      <span>Total essays</span>
    </div>
    <div class="admin-metric-card" data-tone="emerald">
      <div>
        <span class="admin-metric-icon"><CheckCircle2 size={18} /></span>
      </div>
      <strong>{published}</strong>
      <span>Published</span>
    </div>
    <div class="admin-metric-card" data-tone="amber">
      <div>
        <span class="admin-metric-icon"><PencilLine size={18} /></span>
      </div>
      <strong>{drafts}</strong>
      <span>Drafts &amp; scheduled</span>
    </div>
    <div class="admin-metric-card" data-tone="violet">
      <div>
        <span class="admin-metric-icon"><Users size={18} /></span>
      </div>
      <strong>{customerCount}</strong>
      <span>Customers</span>
    </div>
  </div>

  <div class="admin-panel">
    <div class="admin-panel-header">
      <h2>Recent essays</h2>
      <a href="/admin/blog">View all</a>
    </div>
    {#if recent.length}
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {#each recent as post (post.id)}
              <tr>
                <td>
                  <a class="post-link" href={`/admin/blog/${post.id}`}>
                    {post.title}
                  </a>
                </td>
                <td><StatusBadge status={post.status} /></td>
                <td>{formatRelativeTime(post.updatedAt)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <div class="admin-empty-panel">
        <FileText size={28} strokeWidth={1.4} />
        <p>No essays yet. Write your first one to get started.</p>
        <a class="admin-primary-action" href="/admin/blog">Write an essay</a>
      </div>
    {/if}
  </div>
{/if}

<style>
  .post-link {
    font-weight: 700;
    color: #111827;
  }
  .post-link:hover {
    color: #a8431f;
  }
  .admin-table td:nth-child(2) {
    font-weight: 400;
    text-align: left;
  }
</style>
