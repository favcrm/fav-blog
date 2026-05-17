import { writable } from "svelte/store";

export interface ToastAction {
  label: string;
  onPress: () => void;
}

export interface Toast {
  id: number;
  message: string;
  tone: "info" | "success" | "error";
  action?: ToastAction;
}

export interface ToastOptions {
  tone?: Toast["tone"];
  ttl?: number;
  action?: ToastAction;
}

const MAX_TOASTS = 3;

const { subscribe, update } = writable<Toast[]>([]);
let counter = 0;

function push(message: string, options: ToastOptions = {}) {
  const { tone = "info", ttl = 2400, action } = options;
  const id = ++counter;
  update((items) => {
    const next = [...items, { id, message, tone, action }];
    if (next.length > MAX_TOASTS) {
      return next.slice(next.length - MAX_TOASTS);
    }
    return next;
  });
  if (typeof window !== "undefined" && ttl > 0) {
    window.setTimeout(() => {
      update((items) => items.filter((t) => t.id !== id));
    }, ttl);
  }
  return id;
}

function dismiss(id: number) {
  update((items) => items.filter((t) => t.id !== id));
}

export const toasts = {
  subscribe,
  push,
  info: (msg: string, options: Omit<ToastOptions, "tone"> = {}) =>
    push(msg, { ...options, tone: "info" }),
  success: (msg: string, options: Omit<ToastOptions, "tone"> = {}) =>
    push(msg, { ...options, tone: "success" }),
  error: (msg: string, options: Omit<ToastOptions, "tone"> = {}) =>
    push(msg, { ttl: 4000, ...options, tone: "error" }),
  dismiss,
};
