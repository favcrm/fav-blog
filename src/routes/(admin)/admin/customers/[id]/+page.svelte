<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { adminCustomersApi } from "$lib/api/admin";
  import type { AccountDetail, UpdateAccountInput } from "$lib/types/admin";
  import { formatDate } from "$lib/utils/formatting";
  import Badge from "$lib/components/ui/Badge.svelte";
  import LoadingSkeleton from "$lib/components/ui/LoadingSkeleton.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Select from "$lib/components/ui/Select.svelte";
  import ConfirmDialog from "$lib/components/admin/ConfirmDialog.svelte";
  import LoyaltyTransactions from "$lib/components/admin/LoyaltyTransactions.svelte";
  import { Pencil, Trash2 } from "lucide-svelte";

  let customer = $state<AccountDetail | null>(null);
  let loading = $state(true);
  let error = $state("");

  // Edit mode state
  let editing = $state(false);
  let saveLoading = $state(false);
  let saveError = $state("");
  let editForm = $state<UpdateAccountInput>({});

  // Delete dialog state
  let deleteOpen = $state(false);
  let deleteLoading = $state(false);

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
    { value: "import", label: "Import" },
    { value: "api", label: "API" },
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

  onMount(() => { loadCustomer(); });

  async function loadCustomer() {
    loading = true;
    error = "";
    try {
      customer = await adminCustomersApi.get($page.params.id!);
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : "Failed to load customer";
    } finally {
      loading = false;
    }
  }

  function startEditing() {
    if (!customer) return;
    editForm = {
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      type: customer.type as UpdateAccountInput["type"],
      lifeStage: customer.lifeStage as UpdateAccountInput["lifeStage"],
      source: customer.source as UpdateAccountInput["source"],
      notes: customer.notes || "",
    };
    saveError = "";
    editing = true;
  }

  function cancelEditing() {
    editing = false;
    saveError = "";
  }

  async function handleSave() {
    if (!customer) return;
    if (!editForm.name?.trim()) {
      saveError = "Name is required";
      return;
    }
    saveLoading = true;
    saveError = "";
    try {
      await adminCustomersApi.update(customer.id, editForm);
      editing = false;
      await loadCustomer();
    } catch (err: unknown) {
      saveError = err instanceof Error ? err.message : "Failed to update customer";
    } finally {
      saveLoading = false;
    }
  }

  async function handleDelete() {
    if (!customer) return;
    deleteLoading = true;
    try {
      await adminCustomersApi.delete(customer.id);
      goto("/admin/customers");
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : "Failed to delete customer";
      deleteOpen = false;
    } finally {
      deleteLoading = false;
    }
  }

  function cancelDelete() {
    deleteOpen = false;
  }
</script>

<div>
  <a href="/admin/customers" class="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
    &larr; Back to Customers
  </a>

  {#if loading}
    <LoadingSkeleton lines={10} />
  {:else if error}
    <div class="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
  {:else if customer}
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-gray-900">{customer.name || "Unnamed"}</h1>
        <p class="text-sm text-gray-500 mt-1">
          {customer.type} &middot; Joined {formatDate(customer.createdAt)}
        </p>
      </div>
      <div class="flex items-center gap-2">
        {#if !editing}
          <Button variant="outline" size="sm" onclick={startEditing}>
            <Pencil class="w-4 h-4" />
            Edit
          </Button>
        {/if}
        <Button variant="danger" size="sm" onclick={() => (deleteOpen = true)}>
          <Trash2 class="w-4 h-4" />
          Delete
        </Button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main content -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Contact Info -->
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <div class="flex items-center justify-between mb-3">
            <h2 class="font-medium text-gray-900">Contact Information</h2>
            {#if editing}
              <div class="flex items-center gap-2">
                <Button variant="ghost" size="sm" onclick={cancelEditing} disabled={saveLoading}>
                  Cancel
                </Button>
                <Button size="sm" onclick={handleSave} disabled={saveLoading}>
                  {saveLoading ? "Saving..." : "Save"}
                </Button>
              </div>
            {/if}
          </div>

          {#if saveError}
            <div class="p-3 bg-red-50 text-red-700 rounded-lg text-sm mb-3">{saveError}</div>
          {/if}

          {#if editing}
            <div class="space-y-3">
              <Input
                name="name"
                label="Name"
                bind:value={editForm.name}
                required
              />
              <Input
                name="email"
                label="Email"
                type="email"
                bind:value={editForm.email}
              />
              <Input
                name="phone"
                label="Phone"
                type="tel"
                bind:value={editForm.phone}
              />
              <Select
                name="type"
                label="Type"
                bind:value={editForm.type}
                options={typeOptions}
              />
              <Select
                name="lifeStage"
                label="Life Stage"
                bind:value={editForm.lifeStage}
                options={lifeStageOptions}
              />
              <Select
                name="source"
                label="Source"
                bind:value={editForm.source}
                options={sourceOptions}
              />
            </div>
          {:else}
            <dl class="text-sm space-y-3">
              <div class="flex justify-between">
                <dt class="text-gray-500">Email</dt>
                <dd class="text-gray-700">{customer.email ?? "—"}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">Phone</dt>
                <dd class="text-gray-700">{customer.phone ?? "—"}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">Type</dt>
                <dd class="text-gray-700">{customer.type}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">Source</dt>
                <dd class="text-gray-700">{customer.source}</dd>
              </div>
              <div class="flex justify-between items-center">
                <dt class="text-gray-500">Life Stage</dt>
                <dd>
                  <Badge variant={lifeStageBadgeVariant(customer.lifeStage)}>
                    {customer.lifeStage}
                  </Badge>
                </dd>
              </div>
              {#if customer.referredBy}
                <div class="flex justify-between">
                  <dt class="text-gray-500">Referred By</dt>
                  <dd class="text-gray-700">{customer.referredBy.name}</dd>
                </div>
              {/if}
            </dl>
          {/if}
        </div>

        <!-- Contacts -->
        {#if customer.contacts.length > 0}
          <div class="bg-white rounded-lg border border-gray-200 p-4">
            <h2 class="font-medium text-gray-900 mb-3">Contacts ({customer.contacts.length})</h2>
            <div class="divide-y divide-gray-100">
              {#each customer.contacts as contact (contact.id)}
                <div class="py-2">
                  <p class="text-sm font-medium text-gray-900">
                    {contact.name}
                    {#if contact.isPrimary}
                      <span class="text-xs text-blue-600 ml-1">(Primary)</span>
                    {/if}
                  </p>
                  <p class="text-xs text-gray-500">
                    {[contact.email, contact.phone, contact.jobTitle].filter(Boolean).join(" · ")}
                  </p>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Notes -->
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <h2 class="font-medium text-gray-900 mb-2">Notes</h2>
          {#if editing}
            <textarea
              name="notes"
              bind:value={editForm.notes}
              rows="4"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-0 focus:bg-white focus:border-green-700 text-slate-900 font-medium transition-colors rounded-none text-sm"
              placeholder="Add notes about this customer..."
            ></textarea>
          {:else if customer.notes}
            <p class="text-sm text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
          {:else}
            <p class="text-sm text-gray-400">No notes</p>
          {/if}
        </div>

        <!-- Loyalty Transactions -->
        {#if customer.membership}
          {#key customer.id}
            <LoyaltyTransactions accountId={customer.id} />
          {/key}
        {/if}
      </div>

      <!-- Sidebar: Membership -->
      <div class="space-y-4">
        <div class="bg-white rounded-lg border border-gray-200 p-4">
          <h2 class="font-medium text-gray-900 mb-3">Membership</h2>
          {#if customer.membership}
            <dl class="text-sm space-y-2">
              {#if customer.membership.tierName}
                <div class="flex justify-between items-center">
                  <dt class="text-gray-500">Tier</dt>
                  <dd><Badge>{customer.membership.tierName}</Badge></dd>
                </div>
              {/if}
              <div class="flex justify-between">
                <dt class="text-gray-500">Status</dt>
                <dd class="text-gray-700">{customer.membership.status}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">Points</dt>
                <dd class="font-medium text-gray-900">{customer.membership.loyaltyPoints}</dd>
              </div>
              {#if "lifetimePoints" in customer.membership}
                <div class="flex justify-between">
                  <dt class="text-gray-500">Lifetime Points</dt>
                  <dd class="text-gray-700">{customer.membership.lifetimePoints}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-500">Lifetime Spend</dt>
                  <dd class="text-gray-700">${customer.membership.lifetimeSpend.toFixed(2)}</dd>
                </div>
                {#if customer.membership.stamps > 0}
                  <div class="flex justify-between">
                    <dt class="text-gray-500">Stamps</dt>
                    <dd class="text-gray-700">{customer.membership.stamps}</dd>
                  </div>
                {/if}
                <div class="flex justify-between">
                  <dt class="text-gray-500">Member Since</dt>
                  <dd class="text-gray-700">{formatDate(customer.membership.memberSince)}</dd>
                </div>
                {#if customer.membership.expiresAt}
                  <div class="flex justify-between">
                    <dt class="text-gray-500">Expires</dt>
                    <dd class="text-gray-700">{formatDate(customer.membership.expiresAt)}</dd>
                  </div>
                {/if}
              {/if}
            </dl>
          {:else}
            <p class="text-sm text-gray-500">No membership</p>
          {/if}
        </div>

        {#if customer.assignedTo}
          <div class="bg-white rounded-lg border border-gray-200 p-4">
            <h2 class="font-medium text-gray-900 mb-2">Assigned To</h2>
            <p class="text-sm text-gray-700">{customer.assignedTo}</p>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<!-- Delete Confirmation -->
<ConfirmDialog
  bind:open={deleteOpen}
  title="Delete Customer"
  message={customer ? `Are you sure you want to delete "${customer.name || 'this customer'}"? This action cannot be undone.` : ""}
  confirmLabel="Delete"
  confirmVariant="danger"
  loading={deleteLoading}
  onConfirm={handleDelete}
  onCancel={cancelDelete}
/>
