import { format, formatDistanceToNow } from "date-fns";

export function formatDate(date: string): string {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDateTime(date: string): string {
  return format(new Date(date), "MMM d, yyyy h:mm a");
}

export function formatTime(time: string): string {
  // Handle both "14:30" and full ISO strings
  const d = time.includes("T")
    ? new Date(time)
    : new Date(`2000-01-01T${time}`);
  return format(d, "h:mm a");
}

export function formatCurrency(amount: number, currency = "HKD"): string {
  return new Intl.NumberFormat("en-HK", { style: "currency", currency }).format(
    amount,
  );
}

export function formatRelativeTime(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatPrice(amount: number, currency = "HKD"): string {
  return formatCurrency(amount, currency);
}

export function formatDateLong(date: string): string {
  return format(new Date(date), "EEEE, MMMM d, yyyy");
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Something went wrong";
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

export function formatDateLocalized(date: string, locale = "zh-HK"): string {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
