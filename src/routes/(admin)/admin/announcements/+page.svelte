<script lang="ts">
  import { untrack } from "svelte";
  import { adminAnnouncementsApi } from "$lib/api/admin";
  import type { Announcement, AdminPaginatedResponse, CreateAnnouncementInput, AnnouncementStatus } from "$lib/types/admin";
  import { formatDate, getErrorMessage } from "$lib/utils/formatting";

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
  import { Pencil, Trash2, Plus, Megaphone } from "lucide-svelte";

  let search = $state("");
  let page = $state(1);
  let loading = $state(true);
  let data = $state<AdminPaginatedResponse<Announcement> | null>(null);
  let error = $state("");
  let statusFilter = $state("");

  // Create modal state
  let showCreateModal = $state(false);
  let creating = $state(false);
  let createError = $state("");
  let createTitle = $state("");
  let createStatus = $state("DRAFT");

  // Delete dialog state
  let showDeleteDialog = $state(false);
  let deleting = $state(false);
  let deleteTarget = $state<Announcement | null>(null);

  const statusOptions = [
    { value: "DRAFT", label: "Draft" },
    { value: "PUBLISHED", label: "Published" },
  ];

  const statusFilters = [
    { value: "", label: "All" },
    { value: "DRAFT", label: "Draft" },
    { value: "PUBLISHED", label: "Published" },
  ];

  async function loadAnnouncements() {
    loading = true;
    error = "";
    try {
      data = await adminAnnouncementsApi.list({
        page,
        pageSize: 20,
        search: search || undefined,
        status: statusFilter || undefined,
        ordering: "-createdAt",
      });
    } catch (err: unknown) {
      error = getErrorMessage(err);
    } finally {
      loading = false;
    }
  }

  let prevSearch = "";
  let prevFilter = "";

  $effect(() => {
    const s = search;
    const f = statusFilter;
    if (s !== prevSearch || f !== prevFilter) {
      prevSearch = s;
      prevFilter = f;
      page = 1;
    }
    page;
    untrack(() => { loadAnnouncements(); });
  });

  function resetCreateForm() {
    createTitle = "";
    createStatus = "DRAFT";
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
      const input: CreateAnnouncementInput = {
        title: createTitle.trim(),
        status: createStatus as AnnouncementStatus,
      };

      await adminAnnouncementsApi.create(input);
      showCreateModal = false;
      loadAnnouncements();
    } catch (err: unknown) {
      createError = getErrorMessage(err);
    } finally {
      creating = false;
    }
  }

  function confirmDelete(announcement: Announcement) {
    deleteTarget = announcement;
    showDeleteDialog = true;
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    deleting = true;
    try {
      await adminAnnouncementsApi.delete(deleteTarget.id);
      showDeleteDialog = false;
      deleteTarget = null;
      loadAnnouncements();
    } catch (err: unknown) {
      error = getErrorMessage(err);
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
      <h1 class="text-xl font-semibold text-gray-900">Announcements</h1>
      {#if data}
        <span class="text-sm text-gray-500">{data.total} total</span>
      {/if}
    </div>
    <Button variant="primary" size="sm" onclick={openCreateModal}>
      <Plus class="w-4 h-4" />
      New Announcement
    </Button>
  </div>

  <!-- Status filter pills -->
  <div class="flex items-center gap-2 mb-4">
    {#each statusFilters as filter (filter.value)}
      <button
        onclick={() => (statusFilter = filter.value)}
        class="px-3 py-1.5 text-sm font-medium rounded-full transition-colors {statusFilter === filter.value
          ? 'bg-gray-900 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
      >
        {filter.label}
      </button>
    {/each}
  </div>

  <div class="mb-4">
    <SearchInput
      bind:value={search}
      placeholder="Search announcements..."
      class="max-w-md"
    />
  </div>

  {#if loading && !data}
    <LoadingSkeleton lines={8} />
  {:else if error}
    <div class="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
  {:else if data && data.items.length === 0}
    <EmptyState title="No announcements found" message={search ? "Try adjusting your search terms" : "Create your first announcement to get started"}>
      {#snippet icon()}<Megaphone class="w-6 h-6" />{/snippet}
      {#snippet actions()}
        {#if !search}
          <Button size="sm" onclick={openCreateModal}><Plus class="w-4 h-4" /> New Announcement</Button>
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
              <th class="text-left px-4 py-3 font-medium text-gray-600">Created</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600">Updated</th>
              <th class="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each data.items as announcement (announcement.id)}
              <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3">
                  <a href="/admin/announcements/{announcement.id}" class="font-medium text-gray-900 hover:text-blue-600">
                    {announcement.title}
                  </a>
                </td>
                <td class="px-4 py-3">
                  <StatusBadge status={announcement.status} variant="announcement" />
                </td>
                <td class="px-4 py-3 text-gray-500">{formatDate(announcement.createdAt)}</td>
                <td class="px-4 py-3 text-gray-500">{formatDate(announcement.updatedAt)}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-end gap-1">
                    <a
                      href="/admin/announcements/{announcement.id}"
                      class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit"
                    >
                      <Pencil class="w-4 h-4" />
                    </a>
                    <button
                      onclick={() => confirmDelete(announcement)}
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

<!-- Create Announcement Modal -->
<Modal bind:open={showCreateModal} title="New Announcement">
  <form novalidate onsubmit={(e) => { e.preventDefault(); handleCreate(); }} class="space-y-4">
    {#if createError}
      <div class="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{createError}</div>
    {/if}

    <Input
      name="title"
      label="Title"
      bind:value={createTitle}
      placeholder="Announcement title"
      required
    />

    <Select
      name="status"
      label="Status"
      bind:value={createStatus}
      options={statusOptions}
    />

    <div class="flex justify-end gap-2 pt-2">
      <Button variant="ghost" type="button" onclick={() => (showCreateModal = false)} disabled={creating}>
        Cancel
      </Button>
      <Button variant="primary" type="submit" disabled={creating}>
        {creating ? "Creating..." : "Create Announcement"}
      </Button>
    </div>
  </form>
</Modal>

<!-- Delete Confirmation -->
<ConfirmDialog
  bind:open={showDeleteDialog}
  title="Delete Announcement"
  message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.` : ""}
  confirmLabel="Delete"
  confirmVariant="danger"
  loading={deleting}
  onConfirm={handleDelete}
  onCancel={cancelDelete}
/>
