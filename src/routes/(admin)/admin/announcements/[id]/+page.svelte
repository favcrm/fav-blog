<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { adminAnnouncementsApi } from "$lib/api/admin";
  import type { AnnouncementDetail, UpdateAnnouncementInput, AnnouncementStatus } from "$lib/types/admin";
  import { formatDate, getErrorMessage } from "$lib/utils/formatting";
  import { sanitizeHtml } from "$lib/utils/admin-helpers";
  import StatusBadge from "$lib/components/admin/StatusBadge.svelte";
  import LoadingSkeleton from "$lib/components/ui/LoadingSkeleton.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Select from "$lib/components/ui/Select.svelte";
  import ConfirmDialog from "$lib/components/admin/ConfirmDialog.svelte";
  import { Pencil, Trash2 } from "lucide-svelte";

  let announcement = $state<AnnouncementDetail | null>(null);
  let loading = $state(true);
  let error = $state("");

  // Edit mode
  let editing = $state(false);
  let saving = $state(false);
  let editError = $state("");
  let editTitle = $state("");
  let editStatus = $state("");
  let editContent = $state("");

  // Image upload
  let uploading = $state(false);

  // Delete
  let showDeleteDialog = $state(false);
  let deleting = $state(false);

  const statusOptions = [
    { value: "DRAFT", label: "Draft" },
    { value: "PUBLISHED", label: "Published" },
  ];

  onMount(async () => {
    await loadAnnouncement();
  });

  async function loadAnnouncement() {
    loading = true;
    try {
      announcement = await adminAnnouncementsApi.get($page.params.id!);
    } catch (err: unknown) {
      error = getErrorMessage(err);
    } finally {
      loading = false;
    }
  }

  function enterEditMode() {
    if (!announcement) return;
    editTitle = announcement.title;
    editStatus = announcement.status;
    editContent = announcement.content ?? "";
    editError = "";
    editing = true;
  }

  function cancelEdit() {
    editing = false;
    editError = "";
  }

  async function handleSave() {
    if (!announcement) return;
    if (!editTitle.trim()) {
      editError = "Title is required.";
      return;
    }

    saving = true;
    editError = "";
    try {
      const input: UpdateAnnouncementInput = {
        title: editTitle.trim(),
        status: editStatus as AnnouncementStatus,
        content: editContent.trim() || null,
      };

      await adminAnnouncementsApi.update(announcement.id, input);
      editing = false;
      await loadAnnouncement();
    } catch (err: unknown) {
      editError = getErrorMessage(err);
    } finally {
      saving = false;
    }
  }

  async function handleImageUpload(event: Event) {
    if (!announcement) return;
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    uploading = true;
    try {
      await adminAnnouncementsApi.uploadImage(announcement.id, file);
      await loadAnnouncement();
    } catch (err: unknown) {
      error = getErrorMessage(err);
    } finally {
      uploading = false;
      input.value = "";
    }
  }

  async function handleDelete() {
    if (!announcement) return;
    deleting = true;
    try {
      await adminAnnouncementsApi.delete(announcement.id);
      goto("/admin/announcements");
    } catch (err: unknown) {
      error = getErrorMessage(err);
      showDeleteDialog = false;
    } finally {
      deleting = false;
    }
  }
</script>

<div>
  <a href="/admin/announcements" class="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
    &larr; Back to Announcements
  </a>

  {#if loading}
    <LoadingSkeleton lines={10} />
  {:else if error}
    <div class="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
  {:else if announcement}
    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        {#if editing}
          <h1 class="text-xl font-semibold text-gray-900">Editing: {announcement.title}</h1>
        {:else}
          <h1 class="text-xl font-semibold text-gray-900">{announcement.title}</h1>
        {/if}
        <p class="text-sm text-gray-500 mt-1">
          Created {formatDate(announcement.createdAt)}
        </p>
      </div>
      <div class="flex items-center gap-2">
        {#if editing}
          <Button variant="ghost" size="sm" onclick={cancelEdit} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="sm" onclick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        {:else}
          <Button variant="outline" size="sm" onclick={enterEditMode}>
            <Pencil class="w-4 h-4" /> Edit
          </Button>
          <Button variant="danger" size="sm" onclick={() => (showDeleteDialog = true)}>
            <Trash2 class="w-4 h-4" /> Delete
          </Button>
        {/if}
      </div>
    </div>

    {#if editError}
      <div class="p-3 bg-red-50 text-red-700 rounded-lg text-sm mb-4">{editError}</div>
    {/if}

    {#if editing}
      <!-- EDIT MODE -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-4">
          <!-- Basic Info -->
          <div class="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <Input name="editTitle" label="Title" bind:value={editTitle} required />
            <div class="space-y-1">
              <label for="editContent" class="form-label">Content</label>
              <textarea
                id="editContent"
                bind:value={editContent}
                rows="12"
                placeholder="Announcement content (HTML supported)"
                class="form-input text-sm"
              ></textarea>
            </div>
          </div>

          <!-- Featured Image Upload -->
          <div class="bg-white rounded-lg border border-gray-200 p-4">
            <h2 class="font-medium text-gray-900 mb-3">Featured Image</h2>
            {#if announcement.featuredImage}
              <div class="mb-3">
                <img
                  src={announcement.featuredImage}
                  alt={announcement.title}
                  class="max-w-full h-auto rounded-lg max-h-48 object-cover"
                />
              </div>
            {/if}
            <label class="block">
              <span class="text-sm text-gray-600">{uploading ? "Uploading..." : "Upload new image"}</span>
              <input
                type="file"
                accept="image/*"
                onchange={handleImageUpload}
                disabled={uploading}
                class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              />
            </label>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-4">
          <div class="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <Select name="editStatus" label="Status" bind:value={editStatus} options={statusOptions} />
          </div>
        </div>
      </div>
    {:else}
      <!-- VIEW MODE -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-4">
          <!-- Featured Image -->
          {#if announcement.featuredImage}
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <h2 class="font-medium text-gray-900 mb-3">Featured Image</h2>
              <img
                src={announcement.featuredImage}
                alt={announcement.title}
                class="max-w-full h-auto rounded-lg"
              />
            </div>
          {/if}

          <!-- Content -->
          <div class="bg-white rounded-lg border border-gray-200 p-4">
            <h2 class="font-medium text-gray-900 mb-2">Content</h2>
            {#if announcement.content}
              <div class="prose prose-sm max-w-none text-gray-700">
                {@html sanitizeHtml(announcement.content || "")}
              </div>
            {:else}
              <p class="text-sm text-gray-400 italic">No content</p>
            {/if}
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-4">
          <div class="bg-white rounded-lg border border-gray-200 p-4">
            <div class="flex items-center justify-between">
              <h2 class="font-medium text-gray-900">Status</h2>
              <StatusBadge status={announcement.status} variant="announcement" />
            </div>
          </div>

          <div class="bg-white rounded-lg border border-gray-200 p-4">
            <h2 class="font-medium text-gray-900 mb-2">Dates</h2>
            <dl class="text-sm space-y-2">
              <div class="flex justify-between">
                <dt class="text-gray-500">Created</dt>
                <dd class="text-gray-700">{formatDate(announcement.createdAt)}</dd>
              </div>
              {#if announcement.updatedAt}
                <div class="flex justify-between">
                  <dt class="text-gray-500">Updated</dt>
                  <dd class="text-gray-700">{formatDate(announcement.updatedAt)}</dd>
                </div>
              {/if}
            </dl>
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div>

<ConfirmDialog
  bind:open={showDeleteDialog}
  title="Delete Announcement"
  message={announcement ? `Are you sure you want to delete "${announcement.title}"? This action cannot be undone.` : ""}
  confirmLabel="Delete"
  confirmVariant="danger"
  loading={deleting}
  onConfirm={handleDelete}
  onCancel={() => (showDeleteDialog = false)}
/>
