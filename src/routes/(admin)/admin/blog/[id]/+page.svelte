<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { adminBlogApi } from "$lib/api/admin";
  import type { BlogPostDetailAdmin, UpdateBlogPostInput } from "$lib/types/admin";
  import { formatDate } from "$lib/utils/formatting";
  import LoadingSkeleton from "$lib/components/ui/LoadingSkeleton.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Select from "$lib/components/ui/Select.svelte";
  import ConfirmDialog from "$lib/components/admin/ConfirmDialog.svelte";
  import { Trash2 } from "lucide-svelte";

  let post = $state<BlogPostDetailAdmin | null>(null);
  let loading = $state(true);
  let error = $state("");

  // Edit mode is always on in this view, save button in header
  let saving = $state(false);
  let editError = $state("");
  
  let editTitle = $state("");
  let editSlug = $state("");
  let editExcerpt = $state("");
  let editStatus = $state("");
  let editVisibility = $state("");
  let editSeoTitle = $state("");
  let editSeoDescription = $state("");
  let editBlocks = $state(""); // Raw JSON string or text

  // Image Upload
  let uploadingImage = $state(false);
  let fileInput = $state<HTMLInputElement | null>(null);

  // Delete
  let showDeleteDialog = $state(false);
  let deleting = $state(false);

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

  onMount(async () => {
    await loadPost();
  });

  async function loadPost() {
    loading = true;
    try {
      post = await adminBlogApi.get($page.params.id!);
      populateForm();
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : "Failed to load post";
    } finally {
      loading = false;
    }
  }

  function populateForm() {
    if (!post) return;
    editTitle = post.title;
    editSlug = post.slug;
    editExcerpt = post.excerpt ?? "";
    editStatus = post.status;
    editVisibility = post.visibility;
    editSeoTitle = post.seoTitle ?? "";
    editSeoDescription = post.seoDescription ?? "";
    editBlocks = post.blocks ? (typeof post.blocks === 'string' ? post.blocks : JSON.stringify(post.blocks, null, 2)) : "";
  }

  async function handleSave() {
    if (!post) return;
    if (!editTitle.trim()) {
      editError = "Title is required.";
      return;
    }

    saving = true;
    editError = "";
    try {
      const input: UpdateBlogPostInput = {
        title: editTitle.trim(),
        slug: editSlug.trim() || undefined,
        excerpt: editExcerpt.trim() || undefined,
        status: editStatus as UpdateBlogPostInput["status"],
        visibility: editVisibility as UpdateBlogPostInput["visibility"],
        seoTitle: editSeoTitle.trim() || undefined,
        seoDescription: editSeoDescription.trim() || undefined,
        blocks: editBlocks || undefined,
      };

      await adminBlogApi.update(post.id, input);
      await loadPost();
    } catch (err: unknown) {
      editError = err instanceof Error ? err.message : "Failed to update post";
    } finally {
      saving = false;
    }
  }

  async function handleImageUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length || !post) return;
    const file = input.files[0];
    
    uploadingImage = true;
    try {
      const result = await adminBlogApi.uploadImage(post.id, file);
      post.featuredImage = result.featuredImage;
    } catch (err: unknown) {
      editError = err instanceof Error ? err.message : "Failed to upload image";
    } finally {
      uploadingImage = false;
      if (fileInput) fileInput.value = "";
    }
  }

  async function handleDelete() {
    if (!post) return;
    deleting = true;
    try {
      await adminBlogApi.delete(post.id);
      goto("/admin/blog");
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : "Failed to delete post";
      showDeleteDialog = false;
    } finally {
      deleting = false;
    }
  }
</script>

<div>
  <a href="/admin/blog" class="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
    &larr; Back to Blog Posts
  </a>

  {#if loading}
    <LoadingSkeleton lines={10} />
  {:else if error}
    <div class="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
  {:else if post}
    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-gray-900">Editing: {post.title}</h1>
        <p class="text-sm text-gray-500 mt-1">
          Created {formatDate(post.createdAt)}
          {#if post.publishedAt}
            &middot; Published {formatDate(post.publishedAt)}
          {/if}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="danger" size="sm" onclick={() => (showDeleteDialog = true)}>
          <Trash2 class="w-4 h-4" /> Delete
        </Button>
        <Button variant="primary" size="sm" onclick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>

    {#if editError}
      <div class="p-3 bg-red-50 text-red-700 rounded-lg text-sm mb-4">{editError}</div>
    {/if}

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-4">
        <!-- Basic Info -->
        <div class="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          <Input name="editTitle" label="Title" bind:value={editTitle} required />
          <Input name="editSlug" label="Slug" bind:value={editSlug} placeholder="Leave blank to auto-generate" />
          
          <div class="space-y-1">
            <label for="editExcerpt" class="form-label">Excerpt</label>
            <textarea
              id="editExcerpt"
              bind:value={editExcerpt}
              rows="3"
              placeholder="Brief summary..."
              class="form-input text-sm"
            ></textarea>
          </div>
        </div>

        <!-- Content -->
        <div class="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          <div class="space-y-1">
            <label for="editBlocks" class="form-label">Content (HTML or EditorJS JSON)</label>
            <textarea
              id="editBlocks"
              bind:value={editBlocks}
              rows="20"
              placeholder="<p>Write your post content here...</p>"
              class="form-input text-sm font-mono"
            ></textarea>
            <p class="text-xs text-gray-500 mt-1">For advanced editing, use the Merchant Portal.</p>
          </div>
        </div>

        <!-- SEO -->
        <div class="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          <h2 class="font-medium text-gray-900">SEO</h2>
          <Input name="editSeoTitle" label="SEO Title" bind:value={editSeoTitle} placeholder="Optional override" />
          
          <div class="space-y-1">
            <label for="editSeoDescription" class="form-label">SEO Description</label>
            <textarea
              id="editSeoDescription"
              bind:value={editSeoDescription}
              rows="2"
              class="form-input text-sm"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-4">
        <!-- Publishing -->
        <div class="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          <h2 class="font-medium text-gray-900">Publishing</h2>
          <Select name="editStatus" label="Status" bind:value={editStatus} options={statusOptions} />
          <Select name="editVisibility" label="Visibility" bind:value={editVisibility} options={visibilityOptions} />
        </div>

        <!-- Image -->
        <div class="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          <h2 class="font-medium text-gray-900">Featured Image</h2>
          
          {#if post.featuredImage}
            <div class="relative aspect-video rounded-lg overflow-hidden bg-gray-100 mb-2">
              <img src={post.featuredImage} alt="Cover" class="w-full h-full object-cover" />
            </div>
          {/if}

          <div class="mt-2">
            <label class="block">
              <span class="sr-only">Choose profile photo</span>
              <input
                type="file"
                accept="image/*"
                class="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-slate-50 file:text-slate-700
                  hover:file:bg-slate-100
                  cursor-pointer"
                bind:this={fileInput}
                onchange={handleImageUpload}
                disabled={uploadingImage}
              />
            </label>
            {#if uploadingImage}
              <p class="text-xs text-blue-600 mt-2">Uploading...</p>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<ConfirmDialog
  bind:open={showDeleteDialog}
  title="Delete Post"
  message={post ? `Are you sure you want to delete "${post.title}"? This action cannot be undone.` : ""}
  confirmLabel="Delete"
  confirmVariant="danger"
  loading={deleting}
  onConfirm={handleDelete}
  onCancel={() => (showDeleteDialog = false)}
/>
