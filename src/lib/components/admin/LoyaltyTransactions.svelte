<script lang="ts">
  import { onMount } from "svelte";
  import { adminLoyaltyApi } from "$lib/api/admin";
  import type { LoyaltySummary, RewardTransaction, ManualEarnInput } from "$lib/types/admin";
  import { formatDate, getErrorMessage, formatCurrency } from "$lib/utils/formatting";
  import LoadingSkeleton from "$lib/components/ui/LoadingSkeleton.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
  import Badge from "$lib/components/ui/Badge.svelte";
  import { Coins, Plus } from "lucide-svelte";

  interface Props {
    accountId: string;
  }

  let { accountId }: Props = $props();

  let summary = $state<LoyaltySummary | null>(null);
  let transactions = $state<RewardTransaction[]>([]);
  let loading = $state(true);
  let error = $state("");

  // Manual earn modal
  let showEarnModal = $state(false);
  let earning = $state(false);
  let earnError = $state("");
  let earnPoints = $state("");
  let earnStamps = $state("");
  let earnCredit = $state("");
  let earnReference = $state("");

  onMount(() => {
    loadData();
  });

  async function loadData() {
    loading = true;
    error = "";
    try {
      const [s, t] = await Promise.all([
        adminLoyaltyApi.getSummary(accountId),
        adminLoyaltyApi.getTransactions(accountId, 50),
      ]);
      summary = s;
      transactions = t;
    } catch (err: unknown) {
      error = getErrorMessage(err);
    } finally {
      loading = false;
    }
  }

  function openEarnModal() {
    earnPoints = "";
    earnStamps = "";
    earnCredit = "";
    earnReference = "";
    earnError = "";
    showEarnModal = true;
  }

  async function handleEarn() {
    const pts = earnPoints ? parseInt(earnPoints, 10) : undefined;
    const stm = earnStamps ? parseInt(earnStamps, 10) : undefined;
    const crd = earnCredit.trim() || undefined;

    if (!pts && !stm && !crd) {
      earnError = "Enter at least one value (points, stamps, or credits).";
      return;
    }

    earning = true;
    earnError = "";
    try {
      const data: ManualEarnInput = {
        transactionType: "MANUAL",
        reference: earnReference.trim() || "Manual adjustment from admin",
      };
      if (pts) data.points = pts;
      if (stm) data.stamps = stm;
      if (crd) data.credit = crd;

      await adminLoyaltyApi.manualEarn(accountId, data);
      showEarnModal = false;
      await loadData();
    } catch (err: unknown) {
      earnError = getErrorMessage(err);
    } finally {
      earning = false;
    }
  }

  const typeLabels: Record<string, string> = {
    PURCHASE: "Purchase",
    MANUAL: "Manual",
    INITIAL: "Initial",
    ADJUSTMENT: "Adjustment",
    AUTO_REWARD: "Auto Reward",
    REDEMPTION: "Redemption",
    BOOKING: "Booking",
    PACKAGE_PURCHASE: "Package",
    REWARD_CASHBACK: "Cashback",
    CASH_REWARD: "Cash Reward",
    CASH_REWARD_VOID: "Cash Void",
    PURCHASE_VOID: "Purchase Void",
    PAY_WITH_POINTS: "Pay w/ Points",
    POS_CREDIT_DEDUCT: "Credit Deduct",
    POS_CREDIT_REFUND: "Credit Refund",
    POS_REDEEM: "POS Redeem",
    POS_ROLLBACK: "Rollback",
    POS_TOP_UP: "Top Up",
    POS_PURCHASE: "POS Purchase",
    POS_VOID: "POS Void",
    REWARD_EXPIRY: "Expired",
  };

  function typeBadgeVariant(type: string): "success" | "warning" | "error" | "info" | "default" {
    if (type.includes("VOID") || type === "REWARD_EXPIRY") return "error";
    if (type === "REDEMPTION" || type === "PAY_WITH_POINTS" || type.includes("DEDUCT")) return "warning";
    if (type === "PURCHASE" || type === "BOOKING" || type === "AUTO_REWARD") return "success";
    if (type === "MANUAL" || type === "ADJUSTMENT" || type === "INITIAL") return "info";
    return "default";
  }
</script>

<div class="space-y-4">
  {#if loading}
    <LoadingSkeleton lines={6} />
  {:else if error}
    <div class="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
  {:else if summary}
    <!-- Summary Cards -->
    <div class="flex items-center justify-between">
      <h2 class="font-medium text-gray-900">Loyalty</h2>
      <Button variant="outline" size="sm" onclick={openEarnModal}>
        <Plus class="w-4 h-4" /> Adjust Points
      </Button>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-white rounded-lg border border-gray-200 p-3 text-center">
        <p class="text-2xl font-bold text-gray-900">{summary.loyaltyPoints}</p>
        <p class="text-xs text-gray-500 mt-1">Points</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-3 text-center">
        <p class="text-2xl font-bold text-gray-900">{summary.lifetimePoints}</p>
        <p class="text-xs text-gray-500 mt-1">Lifetime Points</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-3 text-center">
        <p class="text-2xl font-bold text-gray-900">{summary.stamps}</p>
        <p class="text-xs text-gray-500 mt-1">Stamps</p>
      </div>
      <div class="bg-white rounded-lg border border-gray-200 p-3 text-center">
        <p class="text-2xl font-bold text-gray-900">{formatCurrency(parseFloat(summary.credits || "0"))}</p>
        <p class="text-xs text-gray-500 mt-1">Credits</p>
      </div>
    </div>

    {#if summary.tier}
      <div class="flex items-center gap-2 text-sm text-gray-600">
        <Coins class="w-4 h-4" />
        Tier: <Badge>{summary.tier.name}</Badge>
        {#if summary.tier.multiplier > 1}
          <span class="text-xs text-gray-400">({summary.tier.multiplier}x multiplier)</span>
        {/if}
      </div>
    {/if}

    <!-- Transaction History -->
    {#if transactions.length > 0}
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-900">Transaction History</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200 bg-gray-50">
                <th class="text-left px-4 py-2 font-medium text-gray-600">Type</th>
                <th class="text-right px-4 py-2 font-medium text-gray-600">Points</th>
                <th class="text-right px-4 py-2 font-medium text-gray-600">Stamps</th>
                <th class="text-right px-4 py-2 font-medium text-gray-600">Credit</th>
                <th class="text-right px-4 py-2 font-medium text-gray-600">Balance</th>
                <th class="text-left px-4 py-2 font-medium text-gray-600">Reference</th>
                <th class="text-left px-4 py-2 font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {#each transactions as tx (tx.id)}
                <tr class="border-b border-gray-100">
                  <td class="px-4 py-2">
                    <Badge variant={typeBadgeVariant(tx.transactionType)}>
                      {typeLabels[tx.transactionType] ?? tx.transactionType}
                    </Badge>
                  </td>
                  <td class="px-4 py-2 text-right font-mono">
                    {#if tx.points && tx.points !== "0"}
                      <span class:text-green-600={parseFloat(tx.points) > 0} class:text-red-600={parseFloat(tx.points) < 0}>
                        {parseFloat(tx.points) > 0 ? "+" : ""}{tx.points}
                      </span>
                    {:else}
                      <span class="text-gray-300">—</span>
                    {/if}
                  </td>
                  <td class="px-4 py-2 text-right font-mono">
                    {#if tx.stamps && tx.stamps !== 0}
                      <span class:text-green-600={tx.stamps > 0} class:text-red-600={tx.stamps < 0}>
                        {tx.stamps > 0 ? "+" : ""}{tx.stamps}
                      </span>
                    {:else}
                      <span class="text-gray-300">—</span>
                    {/if}
                  </td>
                  <td class="px-4 py-2 text-right font-mono">
                    {#if tx.credit && tx.credit !== "0"}
                      <span class:text-green-600={parseFloat(tx.credit) > 0} class:text-red-600={parseFloat(tx.credit) < 0}>
                        {parseFloat(tx.credit) > 0 ? "+" : ""}{formatCurrency(parseFloat(tx.credit))}
                      </span>
                    {:else}
                      <span class="text-gray-300">—</span>
                    {/if}
                  </td>
                  <td class="px-4 py-2 text-right text-gray-500 font-mono text-xs">
                    {tx.pointBalance}pts
                  </td>
                  <td class="px-4 py-2 text-gray-500 text-xs max-w-[200px] truncate">
                    {tx.reference ?? "—"}
                  </td>
                  <td class="px-4 py-2 text-gray-500 text-xs">{formatDate(tx.createdAt)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {:else}
      <div class="bg-white rounded-lg border border-gray-200 p-6 text-center text-sm text-gray-500">
        No transactions yet
      </div>
    {/if}
  {/if}
</div>

<!-- Manual Earn Modal -->
<Modal bind:open={showEarnModal} title="Adjust Points / Credits">
  <form novalidate onsubmit={(e) => { e.preventDefault(); handleEarn(); }} class="space-y-4">
    {#if earnError}
      <div class="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{earnError}</div>
    {/if}

    <p class="text-sm text-gray-500">
      Enter positive values to award, negative to deduct.
    </p>

    <Input
      name="earnPoints"
      label="Points"
      type="number"
      bind:value={earnPoints}
      placeholder="e.g. 100 or -50"
    />

    <Input
      name="earnStamps"
      label="Stamps"
      type="number"
      bind:value={earnStamps}
      placeholder="e.g. 5"
    />

    <Input
      name="earnCredit"
      label="Credits ($)"
      bind:value={earnCredit}
      placeholder="e.g. 10.00"
    />

    <Input
      name="earnReference"
      label="Reference / Reason"
      bind:value={earnReference}
      placeholder="e.g. Birthday bonus"
    />

    <div class="flex justify-end gap-2 pt-2">
      <Button variant="ghost" type="button" onclick={() => (showEarnModal = false)} disabled={earning}>
        Cancel
      </Button>
      <Button variant="primary" type="submit" disabled={earning}>
        {earning ? "Processing..." : "Submit"}
      </Button>
    </div>
  </form>
</Modal>
