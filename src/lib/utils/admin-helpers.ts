import { formatCurrency } from "./formatting";
import type { Promotion, GiftOffer } from "$lib/types/admin";
import type { PromotionType, AutomaticRewardRepeat } from "$lib/types/admin";

// ── Promotion helpers ──

export const promotionTypeOptions = [
  { value: "PERCENTAGE", label: "Percentage" },
  { value: "FIXED_AMOUNT", label: "Fixed Amount" },
  { value: "FREE_SHIPPING", label: "Free Shipping" },
  { value: "BOGO", label: "Buy One Get One" },
  { value: "TIERED", label: "Tiered" },
];

export const promotionTypeLabels: Record<string, string> = Object.fromEntries(
  promotionTypeOptions.map((o) => [o.value, o.label]),
);

export function formatPromotionValue(
  type: PromotionType,
  value: string,
): string {
  switch (type) {
    case "PERCENTAGE":
      return `${value}%`;
    case "FIXED_AMOUNT":
      return formatCurrency(parseFloat(value));
    default:
      return promotionTypeLabels[type] ?? type;
  }
}

export const channelLabels: Record<string, string> = {
  booking: "Booking",
  event: "Event",
  online: "Online",
  pos: "POS",
};

export function getEnabledChannels(
  promo: Pick<
    Promotion,
    "bookingEnabled" | "eventEnabled" | "onlineEnabled" | "posEnabled"
  >,
): string[] {
  const channels: string[] = [];
  if (promo.bookingEnabled) channels.push("booking");
  if (promo.eventEnabled) channels.push("event");
  if (promo.onlineEnabled) channels.push("online");
  if (promo.posEnabled) channels.push("pos");
  return channels;
}

// ── Automatic reward helpers ──

export const triggerLabels: Record<string, string> = {
  NEW_MEMBER_REGISTERED: "New Member",
  NEW_MEMBER_REGISTERED_REFERRAL: "New Referral Member",
  MEMBER_BIRTHDAY: "Birthday",
  MEMBER_BIRTHMONTH: "Birth Month",
  MEMBER_ANNIVERSARY: "Anniversary",
  D30_INACTIVE_MEMBER: "30 Days Inactive",
  D60_INACTIVE_MEMBER: "60 Days Inactive",
  D90_INACTIVE_MEMBER: "90 Days Inactive",
  SERVICE_PACKAGE_PURCHASE: "Package Purchase",
  NEW_REFERRAL: "New Referral",
  MEMBERSHIP_TIER_UPGRADE: "Tier Upgrade",
  POINT_STAMP_REACHED: "Points/Stamps Goal",
};

export const triggerOptions = Object.entries(triggerLabels).map(
  ([value, label]) => ({ value, label }),
);

export const repeatOptions: { value: AutomaticRewardRepeat; label: string }[] =
  [
    { value: "NONE", label: "None" },
    { value: "DAILY", label: "Daily" },
    { value: "WEEKLY", label: "Weekly" },
    { value: "MONTHLY", label: "Monthly" },
    { value: "YEARLY", label: "Yearly" },
  ];

// ── Gift offer helpers ──

export const faceValueTypeOptions = [
  { value: "PERCENTAGE", label: "Percentage" },
  { value: "AMOUNT", label: "Fixed Amount" },
];

export function formatFaceValue(
  offer: Pick<GiftOffer, "faceValue" | "faceValueType">,
): string {
  if (offer.faceValue == null) return "—";
  if (offer.faceValueType === "PERCENTAGE") return `${offer.faceValue}%`;
  return formatCurrency(offer.faceValue);
}

// ── Date helpers ──

export function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

// ── Sanitization ──

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "b",
  "i",
  "em",
  "strong",
  "a",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "pre",
  "code",
  "img",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "div",
  "span",
  "hr",
  "sub",
  "sup",
  "mark",
  "del",
  "ins",
]);

export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s>][\s\S]*?<\/script>/gi, "")
    .replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tag) => {
      if (!ALLOWED_TAGS.has(tag.toLowerCase())) return "";
      return match.replace(
        /\s(on\w+|style|javascript)[^=]*=["'][^"']*["']/gi,
        "",
      );
    });
}
