<script lang="ts">
  import { untrack } from "svelte";
  import { adminBlogApi } from "$lib/api/admin";
  import type { BlogPostAdmin } from "$lib/types/admin";
  import type { AdminPaginatedResponse } from "$lib/types/admin";
  import type { CreateBlogPostInput } from "$lib/types/admin";
  import { formatDate } from "$lib/utils/formatting";

  import StatusBadge from "$lib/components/admin/StatusBadge.svelte";
  import SearchInput from "$lib/components/ui/SearchInput.svelte";
  import Pagination from "$lib/components/ui/Pagination.svelte";
  import LoadingSkeleton from "$lib/components/ui/LoadingSkeleton.svelte";
  import EmptyState from "$lib/components/ui/EmptyState.svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Select from "$lib/components/ui/Select.svelte";
  import ConfirmDialog from "$lib/components/admin/ConfirmDialog.svelte";
  import { Pencil, Trash2, Plus, FileText } from "lucide-svelte";
  import { goto } from "$app/navigation";

  let search = $state("");
  let page = $state(1);
  let loading = $state(true);
  let data = $state<AdminPaginatedResponse<BlogPostAdmin> | null>(null);
  let error = $state("");

  // Create modal state
  let showCreateModal = $state(false);
  let creating = $state(false);
  let createError = $state("");
  let createTitle = $state("");
  let createStatus = $state("draft");
  let createVisibility = $state("public");

  // Delete dialog state
  let showDeleteDialog = $state(false);
  let deleting = $state(false);
  let deleteTarget = $state<BlogPostAdmin | null>(null);

  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "scheduled", label: "Scheduled" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" },
  ];

  const visibilityOptions = [
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
    { value: "members_only", label: "Members Only" },
  ];

  async function loadPosts() {
    loading = true;
    error = "";
    try {
      data = await adminBlogApi.list({
        page,
        pageSize: 20,
        search: search || undefined,
        ordering: "-createdAt",
      });
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : "Failed to load posts";
    } finally {
      loading = false;
    }
  }

  // Reset to page 1 when search changes
  $effect(() => {
    search;
    page = 1;
  });

  $effect(() => {
    search;
    page;
    untrack(() => { loadPosts(); });
  });

  function resetCreateForm() {
    createTitle = "";
    createStatus = "draft";
    createVisibility = "public";
    createError = "";
  }

  function openCreateModal() {
    resetCreateForm();
    showCreateModal = true;
  }

  async function handleCreate() {
    if (!createTitle.trim()) {
      createError = "Title is required.";
      return;
    }

    creating = true;
    createError = "";
    try {
      const created = await adminBlogApi.create({
        title: createTitle.trim(),
        status: createStatus as CreateBlogPostInput["status"],
        visibility: createVisibility as CreateBlogPostInput["visibility"],
        type: "blog_post"
      });
      showCreateModal = false;
      goto(`/admin/blog/${created.id}`);
    } catch (err: unknown) {
      createError = err instanceof Error ? err.message : "Failed to create post";
    } finally {
      creating = false;
    }
  }

  function confirmDelete(post: BlogPostAdmin) {
    deleteTarget = post;
    showDeleteDialog = true;
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    deleting = true;
    try {
      await adminBlogApi.delete(deleteTarget.id);
      showDeleteDialog = false;
      deleteTarget = null;
      loadPosts();
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : "Failed to delete post";
      showDeleteDialog = false;
    } finally {
      deleting = false;
    }
  }

  function cancelDelete() {
    showDeleteDialog = false;
    deleteTarget = null;
  }
</script>

<div>
  <div class="flex items-center justify-between mb-6">
    <div class="flex items-center gap-3">
      <h1 class="text-xl font-semibold text-gray-900">Blog Posts</h1>
      {#if data}
        <span class="text-sm text-gray-500">{data.total} total</span>
      {/if}
    </div>
    <Button variant="primary" size="sm" onclick={openCreateModal}>
      <Plus class="w-4 h-4" />
      New Post
    </Button>
  </div>

  <div class="mb-4">
    <SearchInput
      bind:value={search}
      placeholder="Search posts..."
      class="max-w-md"
    />
  </div>

  {#if loading && !data}
    <LoadingSkeleton lines={8} />
  {:else if error}
    <div class="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
  {:else if data && data.items.length === 0}
    <EmptyState title="No posts found" message={search ? "Try adjusting your search terms" : "Write your first blog post to engage your audience"}>
      {#snippet icon()}<FileText class="w-6 h-6" />{/snippet}
      {#snippet actions()}
        {#if !search}
          <Button size="sm" onclick={openCreateModal}><Plus class="w-4 h-4" /> New Post</Button>
        {/if}
      {/snippet}
    </EmptyState>
  {:else if data}
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50">
              <th class="text-left px-4 py-3 font-medium text-gray-600">Title</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600">Visibility</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600">Published</th>
              <th class="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each data.items as post (post.id)}
              <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3">
                  <a href="/admin/blog/{post.id}" class="flex items-center gap-3">
                    {#if post.featuredImage}
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        class="w-10 h-10 object-cover rounded-md bg-gray-100"
                      />
                    {:else}
                      <div class="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                        <FileText class="w-5 h-5" />
                      </div>
                    {/if}
                    <div>
                      <p class="font-medium text-gray-900">{post.title}</p>
                      {#if post.slug}
                        <p class="text-xs text-gray-500">/{post.slug}</p>
                      {/if}
                    </div>
                  </a>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    class:bg-green-100={post.status === 'published'}
                    class:text-green-800={post.status === 'published'}
                    class:bg-gray-100={post.status === 'draft'}
                    class:text-gray-800={post.status === 'draft'}
                    class:bg-yellow-100={post.status === 'scheduled'}
                    class:text-yellow-800={post.status === 'scheduled'}
                    class:bg-red-100={post.status === 'archived'}
                    class:text-red-800={post.status === 'archived'}
                  >
                    {post.status}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-500 capitalize">{post.visibility.replace('_', ' ')}</td>
                <td class="px-4 py-3 text-gray-500">{post.publishedAt ? formatDate(post.publishedAt) : "—"}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-end gap-1">
                    <a
                      href="/admin/blog/{post.id}"
                      class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit"
                    >
                      <Pencil class="w-4 h-4" />
                    </a>
                    <button
                      onclick={() => confirmDelete(post)}
                      class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <div class="mt-4">
      <Pagination
        currentPage={data.page}
        totalPages={data.pageCount}
        onPageChange={(p) => (page = p)}
      />
    </div>
  {/if}
</div>

<!-- Create Post Modal -->
<Modal bind:open={showCreateModal} title="New Blog Post">
  <form novalidate onsubmit={(e) => { e.preventDefault(); handleCreate(); }} class="space-y-4">
    {#if createError}
      <div class="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{createError}</div>
    {/if}

    <Input
      name="title"
      label="Title"
      bind:value={createTitle}
      placeholder="Post title"
      required
    />

    <Select
      name="status"
      label="Status"
      bind:value={createStatus}
      options={statusOptions}
    />
    
    <Select
      name="visibility"
      label="Visibility"
      bind:value={createVisibility}
      options={visibilityOptions}
    />

    <div class="flex justify-end gap-2 pt-2">
      <Button variant="ghost" type="button" onclick={() => (showCreateModal = false)} disabled={creating}>
        Cancel
      </Button>
      <Button variant="primary" type="submit" disabled={creating}>
        {creating ? "Creating..." : "Create Draft"}
      </Button>
    </div>
  </form>
</Modal>

<!-- Delete Confirmation -->
<ConfirmDialog
  bind:open={showDeleteDialog}
  title="Delete Post"
  message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.` : ""}
  confirmLabel="Delete"
  confirmVariant="danger"
  loading={deleting}
  onConfirm={handleDelete}
  onCancel={cancelDelete}
/>
