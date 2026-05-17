import { writable } from "svelte/store";

export type Locale = "en" | "zh-TW";

export const currentLanguage = writable<Locale>("en");

export function toggleLanguage() {
  currentLanguage.update((lang) => (lang === "en" ? "zh-TW" : "en"));
}

export const m = {
  aria_close: () => "Close",
  aria_previous_page: () => "Previous page",
  aria_next_page: () => "Next page",
  aria_clear_search: () => "Clear search",
  common_error: () => "Something went wrong",
  common_retry: () => "Retry",
  validation_invalid_phone: () => "Enter a valid phone number",
};
