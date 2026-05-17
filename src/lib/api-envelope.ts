export function unwrapApiResponse<T>(json: unknown): T {
  if (json && typeof json === "object" && "success" in json && "data" in json) {
    return (json as { data: T }).data;
  }

  return json as T;
}
