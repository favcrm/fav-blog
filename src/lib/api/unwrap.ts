import type { ApiSuccessResponse } from "$lib/types/api";

/**
 * Unwrap v6 API envelope: `{ success: true, data: T }` → `T`.
 * Falls through to raw value for non-envelope responses (e.g. legacy v5).
 */
export function unwrapApiResponse<T>(json: unknown): T {
  if (
    json &&
    typeof json === "object" &&
    "success" in json &&
    (json as Record<string, unknown>).success === true &&
    "data" in json
  ) {
    return (json as ApiSuccessResponse<T>).data;
  }
  return json as T;
}
