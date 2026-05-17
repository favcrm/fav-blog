<script lang="ts">
  import { adminCategoriesApi } from "$lib/api/admin";
  import type { Category, CreateCategoryInput, Translations } from "$lib/types/admin";
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
  import LoadingSkeleton from "$lib/components/ui/LoadingSkeleton.svelte";
  import EmptyState from "$lib/components/ui/EmptyState.svelte";
  import ConfirmDialog from "$lib/components/admin/ConfirmDialog.svelte";
  import LocaleTabs from "$lib/components/admin/LocaleTabs.svelte";
  import Badge from "$lib/components/ui/Badge.svelte";
  import { Plus, Pencil, Trash2, Tag } from "lucide-svelte";

  let categories = $state<Category[]>([]);
  let loading = $state(true);
  let error = $state("");

  // Modal state
  let modalOpen = $state(false);
  let editingCategory = $state<Category | null>(null);
  let saving = $state(false);
  let formError = $state("");
  let formName = $state("");
  let formOnlineEnabled = $state(true);
  let formSortOrder = $state("0");
  let formTranslations = $state<Translations>({});

  // Delete state
  let deleteOpen = $state(false);
  let deleteLoading = $state(false);
  let deleteTarget = $state<Category | null>(null);

  async function loadCategories() {
    loading = true;
    error = "";
    try {
      categories = await adminCategoriesApi.list();
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : "Failed to load categories";
    } finally {
      loading = false;
    }
  }

  loadCategories();

  function openCreate() {
    editingCategory = null;
    formName = "";
    formOnlineEnabled = true;
    formSortOrder = "0";
    formTranslations = {};
    formError = "";
    modalOpen = true;
  }

  function openEdit(category: Category) {
    editingCategory = category;
    formName = category.name;
    formOnlineEnabled = category.onlineEnabled;
    formSortOrder = String(category.sortOrder);
    formTranslations = category.translations ? { ...category.translations } : {};
    formError = "";
    modalOpen = true;
  }

  async function handleSave() {
    if (!formName.trim()) {
      formError = "Name is required";
      return;
    }

    saving = true;
    formError = "";
    try {
      const data: CreateCategoryInput = {
        name: formName.trim(),
        onlineEnabled: formOnlineEnabled,
        sortOrder: parseInt(formSortOrder, 10) || 0,
        translations: formTranslations,
      };

      if (editingCategory) {
        await adminCategoriesApi.update(editingCategory.id, data);
      } else {
        await adminCategoriesApi.create(data);
      }

      modalOpen = false;
      await loadCategories();
    } catch (err: unknown) {
      formError = err instanceof Error ? err.message : "Failed to save category";
    } finally {
      saving = false;
    }
  }

  function openDelete(category: Category) {
    deleteTarget = category;
    deleteOpen = true;
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    deleteLoading = true;
    try {
      await adminCategoriesApi.delete(deleteTarget.id);
      deleteOpen = false;
      deleteTarget = null;
      await loadCategories();
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : "Failed to delete category";
      deleteOpen = false;
    } finally {
      deleteLoading = false;
    }
  }

  const modalTitle = $derived(editingCategory ? "Edit Category" : "Add Category");
</script>

<div>
  <div class="flex items-center justify-between mb-6">
    <div class="flex items-center gap-3">
      <h1 class="text-xl font-semibold text-gray-900">Categories</h1>
      <span class="text-sm text-gray-500">{categories.length} total</span>
    </div>
    <Button size="sm" onclick={openCreate}>
      <Plus class="w-4 h-4" />
      Add Category
    </Button>
  </div>

  {#if loading}
    <LoadingSkeleton lines={6} />
  {:else if error}
    <div class="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
  {:else if categories.length === 0}
    <EmptyState title="No categories yet" message="Organize your products by creating categories">
      {#snippet icon()}<Tag class="w-6 h-6" />{/snippet}
      {#snippet actions()}
        <Button size="sm" onclick={openCreate}><Plus class="w-4 h-4" /> Add Category</Button>
      {/snippet}
    </EmptyState>
  {:else}
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 bg-gray-50">
            <th class="text-left px-4 py-3 font-medium text-gray-600">Name</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Online</th>
            <th class="text-right px-4 py-3 font-medium text-gray-600">Sort</th>
            <th class="text-right px-4 py-3 font-medium text-gray-600">Products</th>
            <th class="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each categories as category (category.id)}
            <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 font-medium text-gray-900">{category.name}</td>
              <td class="px-4 py-3 text-gray-500 font-mono text-xs">{category.slug}</td>
              <td class="px-4 py-3">
                <Badge variant={category.onlineEnabled ? "success" : "default"}>
                  {category.onlineEnabled ? "Yes" : "No"}
                </Badge>
              </td>
              <td class="px-4 py-3 text-right text-gray-500 tabular-nums">{category.sortOrder}</td>
              <td class="px-4 py-3 text-right text-gray-700 tabular-nums">{category.productCount}</td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button
                    onclick={() => openEdit(category)}
                    class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Edit"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button
                    onclick={() => openDelete(category)}
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
  {/if}
</div>

<Modal bind:open={modalOpen} title={modalTitle}>
  <form novalidate onsubmit={(e) => { e.preventDefault(); handleSave(); }} class="space-y-4">
    {#if formError}
      <div class="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{formError}</div>
    {/if}

    <Input
      name="categoryName"
      label="Name"
      bind:value={formName}
      placeholder="Category name"
      required
    />

    <Input
      name="sortOrder"
      label="Sort Order"
      type="number"
      bind:value={formSortOrder}
      placeholder="0"
    />

    <div class="flex items-center gap-2">
      <input
        type="checkbox"
        id="onlineEnabled"
        bind:checked={formOnlineEnabled}
        class="rounded border-gray-300"
      />
      <label for="onlineEnabled" class="text-sm text-gray-700">Show online</label>
    </div>

    <LocaleTabs
      translations={formTranslations}
      onchange={(t) => (formTranslations = t)}
      showDescription={false}
      baseName={formName}
    />

    <div class="flex justify-end gap-2 pt-2">
      <Button variant="ghost" type="button" onclick={() => (modalOpen = false)} disabled={saving}>
        Cancel
      </Button>
      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"}
      </Button>
    </div>
  </form>
</Modal>

<ConfirmDialog
  bind:open={deleteOpen}
  title="Delete Category"
  message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.name}"?${deleteTarget.productCount > 0 ? ` This category has ${deleteTarget.productCount} products.` : ""}` : ""}
  confirmLabel="Delete"
  confirmVariant="danger"
  loading={deleteLoading}
  onConfirm={handleDelete}
  onCancel={() => { deleteOpen = false; deleteTarget = null; }}
/>
