<script lang="ts">
  interface Props {
    status: string;
    variant?: "order" | "product" | "tier" | "invoice" | "promotion" | "announcement" | "automaticReward" | "giftOffer" | "redemption";
  }

  let { status, variant = "order" }: Props = $props();

  const colorMap: Record<string, Record<string, string>> = {
    order: {
      pending: "bg-amber-100 text-amber-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    },
    product: {
      ACTIVE: "bg-green-100 text-green-800",
      DRAFT: "bg-gray-100 text-gray-600",
      ARCHIVED: "bg-red-100 text-red-800",
    },
    tier: {
      ACTIVE: "bg-green-100 text-green-800",
      INACTIVE: "bg-gray-100 text-gray-600",
    },
    invoice: {
      DRAFT: "bg-gray-100 text-gray-600",
      SENT: "bg-blue-100 text-blue-800",
      PAID: "bg-green-100 text-green-800",
      OVERDUE: "bg-red-100 text-red-800",
      VOID: "bg-gray-100 text-gray-500",
      CANCELLED: "bg-red-100 text-red-600",
    },
    promotion: {
      DRAFT: "bg-gray-100 text-gray-600",
      ACTIVE: "bg-green-100 text-green-800",
      PAUSED: "bg-amber-100 text-amber-800",
      EXPIRED: "bg-red-100 text-red-800",
    },
    announcement: {
      DRAFT: "bg-gray-100 text-gray-600",
      PUBLISHED: "bg-green-100 text-green-800",
    },
    automaticReward: {
      ACTIVE: "bg-green-100 text-green-800",
      EXECUTED: "bg-blue-100 text-blue-800",
      DISABLED: "bg-gray-100 text-gray-600",
    },
    giftOffer: {
      DRAFT: "bg-gray-100 text-gray-600",
      ACTIVE: "bg-green-100 text-green-800",
      INACTIVE: "bg-amber-100 text-amber-800",
      ARCHIVED: "bg-red-100 text-red-800",
    },
    redemption: {
      VALID: "bg-green-100 text-green-800",
      USED: "bg-blue-100 text-blue-800",
      EXPIRED: "bg-gray-100 text-gray-500",
      VOIDED: "bg-red-100 text-red-600",
    },
  };

  let colorClass = $derived(
    colorMap[variant]?.[status] ?? "bg-gray-100 text-gray-600",
  );

  let label = $derived(
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
  );
</script>

<span
  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {colorClass}"
>
  {label}
</span>
