<script lang="ts">
  import { untrack } from "svelte";
  import { adminCustomersApi } from "$lib/api/admin";
  import type { Account, AdminPaginatedResponse, CreateAccountInput } from "$lib/types/admin";
  import { formatDate } from "$lib/utils/formatting";
  import SearchInput from "$lib/components/ui/SearchInput.svelte";
  import Pagination from "$lib/components/ui/Pagination.svelte";
  import LoadingSkeleton from "$lib/components/ui/LoadingSkeleton.svelte";
  import EmptyState from "$lib/components/ui/EmptyState.svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Select from "$lib/components/ui/Select.svelte";
  import Badge from "$lib/components/ui/Badge.svelte";
  import ConfirmDialog from "$lib/components/admin/ConfirmDialog.svelte";
  import { Pencil, Trash2, Plus, Users } from "lucide-svelte";

  let search = $state("");
  let page = $state(1);
  let loading = $state(true);
  let data = $state<AdminPaginatedResponse<Account> | null>(null);
  let error = $state("");

  // Create modal state
  let createOpen = $state(false);
  let createLoading = $state(false);
  let createError = $state("");
  let createForm = $state<CreateAccountInput>({
    name: "",
    email: "",
    phone: "",
    type: "individual",
    lifeStage: "lead",
    source: "walk_in",
  });

  // Delete dialog state
  let deleteOpen = $state(false);
  let deleteLoading = $state(false);
  let deleteTarget = $state<Account | null>(null);

  const typeOptions = [
    { value: "individual", label: "Individual" },
    { value: "business", label: "Business" },
    { value: "household", label: "Household" },
  ];

  const lifeStageOptions = [
    { value: "lead", label: "Lead" },
    { value: "active", label: "Active" },
    { value: "churned", label: "Churned" },
    { value: "vip", label: "VIP" },
  ];

  const sourceOptions = [
    { value: "walk_in", label: "Walk-in" },
    { value: "online", label: "Online" },
    { value: "pos", label: "POS" },
    { value: "whatsapp", label: "WhatsApp" },
    { value: "referral", label: "Referral" },
  ];

  function lifeStageBadgeVariant(stage: string): "success" | "warning" | "error" | "info" | "default" {
    switch (stage) {
      case "vip": return "success";
      case "active": return "info";
      case "lead": return "warning";
      case "churned": return "error";
      default: return "default";
    }
  }

  async function loadCustomers() {
    loading = true;
    error = "";
    try {
      data = await adminCustomersApi.list({
        page,
        pageSize: 20,
        search: search || undefined,
        ordering: "-createdAt",
      });
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : "Failed to load customers";
    } finally {
      loading = false;
    }
  }

  function resetCreateForm() {
    createForm = {
      name: "",
      email: "",
      phone: "",
      type: "individual",
      lifeStage: "lead",
      source: "walk_in",
    };
    createError = "";
  }

  function openCreateModal() {
    resetCreateForm();
    createOpen = true;
  }

  async function handleCreate() {
    if (!createForm.name.trim()) {
      createError = "Name is required";
      return;
    }
    createLoading = true;
    createError = "";
    try {
      const input: CreateAccountInput = { name: createForm.name.trim() };
      if (createForm.email) input.email = createForm.email;
      if (createForm.phone) input.phone = createForm.phone;
      if (createForm.type) input.type = createForm.type;
      if (createForm.lifeStage) input.lifeStage = createForm.lifeStage;
      if (createForm.source) input.source = createForm.source;
      await adminCustomersApi.create(input);
      createOpen = false;
      await loadCustomers();
    } catch (err: unknown) {
      createError = err instanceof Error ? err.message : "Failed to create customer";
    } finally {
      createLoading = false;
    }
  }

  function openDeleteDialog(customer: Account) {
    deleteTarget = customer;
    deleteOpen = true;
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    deleteLoading = true;
    try {
      await adminCustomersApi.delete(deleteTarget.id);
      deleteOpen = false;
      deleteTarget = null;
      await loadCustomers();
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : "Failed to delete customer";
      deleteOpen = false;
    } finally {
      deleteLoading = false;
    }
  }

  function cancelDelete() {
    deleteOpen = false;
    deleteTarget = null;
  }

  // Reset to page 1 when search changes
  $effect(() => {
    search;
    page = 1;
  });

  $effect(() => {
    search;
    page;
    untrack(() => { loadCustomers(); });
  });
</script>

<div>
  <div class="flex items-center justify-between mb-6">
    <div class="flex items-center gap-3">
      <h1 class="text-xl font-semibold text-gray-900">Customers</h1>
      {#if data}
        <span class="text-sm text-gray-500">{data.total} total</span>
      {/if}
    </div>
    <Button size="sm" onclick={openCreateModal}>
      <Plus class="w-4 h-4" />
      Add Customer
    </Button>
  </div>

  <div class="mb-4">
    <SearchInput
      bind:value={search}
      placeholder="Search by name, email, or phone..."
      class="max-w-md"
    />
  </div>

  {#if loading && !data}
    <LoadingSkeleton lines={8} />
  {:else if error}
    <div class="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
  {:else if data && data.items.length === 0}
    <EmptyState title="No customers found" message={search ? "Try adjusting your search terms" : "Add your first customer to get started"}>
      {#snippet icon()}<Users class="w-6 h-6" />{/snippet}
      {#snippet actions()}
        {#if !search}
          <Button size="sm" onclick={openCreateModal}><Plus class="w-4 h-4" /> Add Customer</Button>
        {/if}
      {/snippet}
    </EmptyState>
  {:else if data}
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50">
              <th class="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600">Life Stage</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600">Membership</th>
              <th class="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
              <th class="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each data.items as customer (customer.id)}
              <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3">
                  <a href="/admin/customers/{customer.id}" class="font-medium text-blue-600 hover:text-blue-800">
                    {customer.name || "—"}
                  </a>
                </td>
                <td class="px-4 py-3 text-gray-600">{customer.email ?? "—"}</td>
                <td class="px-4 py-3 text-gray-600">{customer.phone ?? "—"}</td>
                <td class="px-4 py-3">
                  <Badge variant={lifeStageBadgeVariant(customer.lifeStage)}>
                    {customer.lifeStage}
                  </Badge>
                </td>
                <td class="px-4 py-3">
                  {#if customer.membership?.tierName}
                    <Badge>{customer.membership.tierName}</Badge>
                  {:else}
                    <span class="text-gray-400">—</span>
                  {/if}
                </td>
                <td class="px-4 py-3 text-gray-500">{formatDate(customer.createdAt)}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-end gap-1">
                    <a
                      href="/admin/customers/{customer.id}"
                      class="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Edit"
                    >
                      <Pencil class="w-4 h-4" />
                    </a>
                    <button
                      onclick={() => openDeleteDialog(customer)}
                      class="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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

<!-- Create Customer Modal -->
<Modal bind:open={createOpen} title="Add Customer">
  <form novalidate onsubmit={(e) => { e.preventDefault(); handleCreate(); }} class="space-y-4">
    {#if createError}
      <div class="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{createError}</div>
    {/if}

    <Input
      name="name"
      label="Name"
      bind:value={createForm.name}
      placeholder="Customer name"
      required
    />

    <Input
      name="email"
      label="Email"
      type="email"
      bind:value={createForm.email}
      placeholder="email@example.com"
    />

    <Input
      name="phone"
      label="Phone"
      type="tel"
      bind:value={createForm.phone}
      placeholder="+852 1234 5678"
    />

    <Select
      name="type"
      label="Type"
      bind:value={createForm.type}
      options={typeOptions}
    />

    <Select
      name="lifeStage"
      label="Life Stage"
      bind:value={createForm.lifeStage}
      options={lifeStageOptions}
    />

    <Select
      name="source"
      label="Source"
      bind:value={createForm.source}
      options={sourceOptions}
    />

    <div class="flex justify-end gap-2 pt-2">
      <Button variant="ghost" type="button" onclick={() => (createOpen = false)}>
        Cancel
      </Button>
      <Button type="submit" disabled={createLoading}>
        {createLoading ? "Creating..." : "Create Customer"}
      </Button>
    </div>
  </form>
</Modal>

<!-- Delete Confirmation -->
<ConfirmDialog
  bind:open={deleteOpen}
  title="Delete Customer"
  message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.name || 'this customer'}"? This action cannot be undone.` : ""}
  confirmLabel="Delete"
  confirmVariant="danger"
  loading={deleteLoading}
  onConfirm={handleDelete}
  onCancel={cancelDelete}
/>
