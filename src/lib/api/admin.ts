import { get } from "svelte/store";
import { adminAuthStore, adminLogout } from "$lib/stores/admin-auth";
import { ApiError } from "$lib/types/api";
import type { ApiErrorResponse } from "$lib/types/api";
import { unwrapApiResponse } from "./unwrap";
import type {
  AdminAuthResponse,
  ListParams,
  AdminPaginatedResponse,
  Product,
  ProductDetail,
  CreateProductInput,
  UpdateProductInput,
  UpdateImageInput,
  CreateOptionInput,
  UpdateOptionInput,
  ProductVariationAdmin,
  CreateVariationInput,
  UpdateVariationInput,
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  Order,
  OrderDetail,
  Account,
  AccountDetail,
  CreateAccountInput,
  UpdateAccountInput,
  MembershipTier,
  CreateTierInput,
  UpdateTierInput,
  DashboardStats,
  AcquisitionChannel,
  Invoice,
  InvoiceDetail,
  InvoiceStats,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  PaymentTransaction,
  RefundInput,
  RefundResult,
  PaymentMethod,
  CreatePaymentMethodInput,
  UpdatePaymentMethodInput,
  ShippingMethod,
  CreateShippingMethodInput,
  UpdateShippingMethodInput,
  Promotion,
  PromotionDetail,
  CreatePromotionInput,
  UpdatePromotionInput,
  PromotionUsage,
  Announcement,
  AnnouncementDetail,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
  RewardScheme,
  CreateRewardSchemeInput,
  UpdateRewardSchemeInput,
  AutomaticReward,
  AutomaticRewardDetail,
  CreateAutomaticRewardInput,
  UpdateAutomaticRewardInput,
  GiftOffer,
  GiftOfferDetail,
  CreateGiftOfferInput,
  UpdateGiftOfferInput,
  RewardRedemption,
  CreateRewardRedemptionInput,
  IssueRewardsInput,
  LoyaltySummary,
  RewardTransaction,
  ManualEarnInput,
} from "$lib/types/admin";

const API_URL = (
  (import.meta.env.VITE_API_URL as string | undefined) ??
  (import.meta.env.VITE_FAVCRM_API_URL as string | undefined) ??
  "https://api.favcrm.io"
).replace(/\/$/, "");

// ── Shared fetch core ──

interface AdminRequestOptions {
  method?: string;
  body?: unknown;
  params?: Record<string, string>;
  requiresAuth?: boolean;
  headers?: Record<string, string>;
}

function buildUrl(path: string, params?: Record<string, string>): string {
  const url = new URL(`${API_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

function buildHeaders(
  requiresAuth: boolean,
  includeContentType: boolean,
): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Accept-Language": "en-US",
  };
  if (includeContentType) headers["Content-Type"] = "application/json";
  if (requiresAuth) {
    const auth = get(adminAuthStore);
    if (auth.jwt) headers["Authorization"] = `Bearer ${auth.jwt}`;
  }
  return headers;
}

function parseApiError(errorData: unknown): { message: string; code?: string } {
  if (
    errorData &&
    typeof errorData === "object" &&
    "success" in errorData &&
    !(errorData as Record<string, unknown>).success
  ) {
    const apiError = errorData as ApiErrorResponse;
    return { message: apiError.error.message, code: apiError.error.code };
  }
  if (typeof errorData === "string") return { message: errorData };
  if (errorData && typeof errorData === "object") {
    const msg = (errorData as Record<string, unknown>).message;
    if (msg)
      return { message: typeof msg === "string" ? msg : JSON.stringify(msg) };
  }
  return { message: "Request failed" };
}

async function handleResponse<T>(
  response: Response,
): Promise<{ data: T; headers: Headers }> {
  if (response.status === 401) {
    adminLogout();
    throw new ApiError(401, "Unauthorized");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const { message, code } = parseApiError(errorData);
    throw new ApiError(response.status, message, code);
  }

  if (response.status === 204) {
    return { data: undefined as T, headers: response.headers };
  }

  const json = await response.json();
  return { data: unwrapApiResponse<T>(json), headers: response.headers };
}

async function adminApiRequest<T>(
  path: string,
  options: AdminRequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    params,
    requiresAuth = true,
    headers: extraHeaders,
  } = options;
  const response = await fetch(buildUrl(path, params), {
    method,
    headers: { ...buildHeaders(requiresAuth, true), ...extraHeaders },
    body: body ? JSON.stringify(body) : undefined,
  });
  const { data } = await handleResponse<T>(response);
  return data;
}

async function adminApiRequestWithHeaders<T>(
  path: string,
  params?: Record<string, string>,
): Promise<{ data: T; headers: Headers }> {
  const response = await fetch(buildUrl(path, params), {
    headers: buildHeaders(true, false),
  });
  return handleResponse<T>(response);
}

async function adminApiUpload<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: buildHeaders(true, false),
    body: formData,
  });
  const { data } = await handleResponse<T>(response);
  return data;
}

async function adminApiBlob(path: string): Promise<Blob> {
  const response = await fetch(buildUrl(path), {
    headers: buildHeaders(true, false),
  });
  if (response.status === 401) {
    adminLogout();
    throw new ApiError(401, "Unauthorized");
  }
  if (!response.ok) {
    throw new ApiError(response.status, "Download failed");
  }
  return response.blob();
}

function serializeListParams(params?: ListParams): Record<string, string> {
  const out: Record<string, string> = {};
  if (!params) return out;
  if (params.page) out["page"] = String(params.page);
  if (params.pageSize) out["page_size"] = String(params.pageSize);
  if (params.ordering) out["ordering"] = params.ordering;
  if (params.search) out["search"] = params.search;
  if (params.status) out["status"] = params.status;
  return out;
}

interface PaginatedBody<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

function isPaginatedBody<T>(data: unknown): data is PaginatedBody<T> {
  return (
    data !== null &&
    typeof data === "object" &&
    "items" in data &&
    Array.isArray((data as Record<string, unknown>).items) &&
    "pagination" in data
  );
}

async function listResource<T>(
  basePath: string,
  params?: ListParams,
): Promise<AdminPaginatedResponse<T>> {
  const { data, headers } = await adminApiRequestWithHeaders<
    T[] | PaginatedBody<T>
  >(basePath, serializeListParams(params));

  // API returns { items: T[], pagination: {...} } in body
  if (isPaginatedBody<T>(data)) {
    return {
      items: data.items,
      total: data.pagination.total,
      page: data.pagination.page,
      pageSize: data.pagination.limit,
      pageCount: data.pagination.totalPages,
    };
  }

  // Fallback: flat array with header-based pagination
  return {
    items: data as T[],
    total: parseInt(headers.get("X-Total") ?? "0", 10),
    page: parseInt(headers.get("X-Current-Page") ?? "1", 10),
    pageSize: parseInt(headers.get("X-Page-Size") ?? "20", 10),
    pageCount: parseInt(headers.get("X-Page-Count") ?? "1", 10),
  };
}

// ── Auth ──

const COMPANY_ID = import.meta.env.VITE_COMPANY_ID as string | undefined;

export const adminAuthApi = {
  login: (email: string, password: string) =>
    adminApiRequest<AdminAuthResponse>("/v6/merchant/auth/login", {
      method: "POST",
      body: { email, password },
      requiresAuth: false,
      headers: COMPANY_ID ? { "X-Company-Id": COMPANY_ID } : undefined,
    }),

  verify: () =>
    adminApiRequest<{ valid: boolean }>("/v6/merchant/auth/verify", {
      method: "POST",
    }),
};

// ── Products ──

export const adminProductsApi = {
  list: (params?: ListParams) =>
    listResource<Product>("/v6/merchant/shop/products", params),

  get: (id: number | string) =>
    adminApiRequest<ProductDetail>(`/v6/merchant/shop/products/${id}`),

  create: (data: CreateProductInput) =>
    adminApiRequest<{ productId: number }>("/v6/merchant/shop/products", {
      method: "POST",
      body: data,
    }),

  update: (id: number | string, data: UpdateProductInput) =>
    adminApiRequest<{ success: boolean }>(`/v6/merchant/shop/products/${id}`, {
      method: "PATCH",
      body: data,
    }),

  delete: (id: number | string) =>
    adminApiRequest<{ success: boolean }>(`/v6/merchant/shop/products/${id}`, {
      method: "DELETE",
    }),

  // Images
  uploadImage: (productId: number | string, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return adminApiUpload<{ id: number; src: string }>(
      `/v6/merchant/shop/products/${productId}/images`,
      formData,
    );
  },

  updateImage: (
    productId: number | string,
    imageId: number,
    data: UpdateImageInput,
  ) =>
    adminApiRequest<{ success: boolean }>(
      `/v6/merchant/shop/products/${productId}/images/${imageId}`,
      { method: "PATCH", body: data },
    ),

  deleteImage: (productId: number | string, imageId: number) =>
    adminApiRequest<{ success: boolean }>(
      `/v6/merchant/shop/products/${productId}/images/${imageId}`,
      { method: "DELETE" },
    ),

  // Options
  createOption: (productId: number | string, data: CreateOptionInput) =>
    adminApiRequest<{ optionId: number }>(
      `/v6/merchant/shop/products/${productId}/options`,
      { method: "POST", body: data },
    ),

  updateOption: (
    productId: number | string,
    optionId: number,
    data: UpdateOptionInput,
  ) =>
    adminApiRequest<{ success: boolean }>(
      `/v6/merchant/shop/products/${productId}/options/${optionId}`,
      { method: "PATCH", body: data },
    ),

  deleteOption: (productId: number | string, optionId: number) =>
    adminApiRequest<{ success: boolean }>(
      `/v6/merchant/shop/products/${productId}/options/${optionId}`,
      { method: "DELETE" },
    ),

  // Variations
  listVariations: (productId: number | string) =>
    adminApiRequest<ProductVariationAdmin[]>(
      `/v6/merchant/shop/products/${productId}/variations`,
    ),

  createVariation: (productId: number | string, data: CreateVariationInput) =>
    adminApiRequest<{ variationId: number }>(
      `/v6/merchant/shop/products/${productId}/variations`,
      { method: "POST", body: data },
    ),

  updateVariation: (
    productId: number | string,
    variationId: number,
    data: UpdateVariationInput,
  ) =>
    adminApiRequest<{ success: boolean }>(
      `/v6/merchant/shop/products/${productId}/variations/${variationId}`,
      { method: "PATCH", body: data },
    ),

  deleteVariation: (productId: number | string, variationId: number) =>
    adminApiRequest<{ success: boolean }>(
      `/v6/merchant/shop/products/${productId}/variations/${variationId}`,
      { method: "DELETE" },
    ),
};

// ── Categories ──

export const adminCategoriesApi = {
  list: () => adminApiRequest<Category[]>("/v6/merchant/shop/categories"),

  create: (data: CreateCategoryInput) =>
    adminApiRequest<{ categoryId: number }>("/v6/merchant/shop/categories", {
      method: "POST",
      body: data,
    }),

  update: (id: number | string, data: UpdateCategoryInput) =>
    adminApiRequest<{ success: boolean }>(
      `/v6/merchant/shop/categories/${id}`,
      {
        method: "PATCH",
        body: data,
      },
    ),

  delete: (id: number | string) =>
    adminApiRequest<{ success: boolean }>(
      `/v6/merchant/shop/categories/${id}`,
      {
        method: "DELETE",
      },
    ),
};

// ── Orders ──

export const adminOrdersApi = {
  list: (params?: ListParams) =>
    listResource<Order>("/v6/merchant/shop/orders", params),

  get: (orderId: string) =>
    adminApiRequest<OrderDetail>(`/v6/merchant/shop/orders/${orderId}`),

  updateStatus: (orderId: string, data: { status: string }) =>
    adminApiRequest<{ success: boolean }>(
      `/v6/merchant/shop/orders/${orderId}`,
      {
        method: "PATCH",
        body: data,
      },
    ),
};

// ── Customers (Accounts) ──

export const adminCustomersApi = {
  list: (params?: ListParams) =>
    listResource<Account>("/v6/merchant/accounts", params),

  get: (id: string | number) =>
    adminApiRequest<AccountDetail>(`/v6/merchant/accounts/${id}`),

  create: (data: CreateAccountInput) =>
    adminApiRequest<AccountDetail>("/v6/merchant/accounts", {
      method: "POST",
      body: data,
    }),

  update: (id: string | number, data: UpdateAccountInput) =>
    adminApiRequest<AccountDetail>(`/v6/merchant/accounts/${id}`, {
      method: "PATCH",
      body: data,
    }),

  delete: (id: string | number) =>
    adminApiRequest<void>(`/v6/merchant/accounts/${id}`, {
      method: "DELETE",
    }),
};

// ── Dashboard ──

export const adminDashboardApi = {
  stats: () => adminApiRequest<DashboardStats>("/v6/merchant/dashboard"),

  acquisitionChannels: () =>
    adminApiRequest<AcquisitionChannel[]>(
      "/v6/merchant/dashboard/acquisition-channels",
    ),
};

// ── Invoices ──

export const adminInvoicesApi = {
  list: (params?: ListParams) =>
    listResource<Invoice>("/v6/merchant/invoices", params),

  get: (id: string) =>
    adminApiRequest<InvoiceDetail>(`/v6/merchant/invoices/${id}`),

  stats: () => adminApiRequest<InvoiceStats>("/v6/merchant/invoices/stats"),

  create: (data: CreateInvoiceInput) =>
    adminApiRequest<{ id: string; invoiceNumber: string }>(
      "/v6/merchant/invoices",
      {
        method: "POST",
        body: data,
      },
    ),

  update: (id: string, data: UpdateInvoiceInput) =>
    adminApiRequest<{ success: boolean }>(`/v6/merchant/invoices/${id}`, {
      method: "PATCH",
      body: data,
    }),

  delete: (id: string) =>
    adminApiRequest<{ success: boolean }>(`/v6/merchant/invoices/${id}`, {
      method: "DELETE",
    }),

  void: (id: string) =>
    adminApiRequest<{ success: boolean }>(`/v6/merchant/invoices/${id}/void`, {
      method: "POST",
    }),

  downloadPdf: async (id: string) => {
    const blob = await adminApiBlob(`/v6/merchant/invoices/${id}/download-pdf`);
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  },
};

// ── Payment Methods ──

export const adminPaymentMethodsApi = {
  list: () => adminApiRequest<PaymentMethod[]>("/v6/merchant/payment-methods"),

  get: (id: string) =>
    adminApiRequest<PaymentMethod>(`/v6/merchant/payment-methods/${id}`),

  create: (data: CreatePaymentMethodInput) =>
    adminApiRequest<PaymentMethod>("/v6/merchant/payment-methods", {
      method: "POST",
      body: data,
    }),

  update: (id: string, data: UpdatePaymentMethodInput) =>
    adminApiRequest<PaymentMethod>(`/v6/merchant/payment-methods/${id}`, {
      method: "PATCH",
      body: data,
    }),

  delete: (id: string) =>
    adminApiRequest<{ id: string }>(`/v6/merchant/payment-methods/${id}`, {
      method: "DELETE",
    }),
};

// ── Shipping Methods ──

export const adminShippingMethodsApi = {
  list: () =>
    adminApiRequest<ShippingMethod[]>("/v6/merchant/shop/shipping-methods"),

  get: (id: number) =>
    adminApiRequest<ShippingMethod>(`/v6/merchant/shop/shipping-methods/${id}`),

  create: (data: CreateShippingMethodInput) =>
    adminApiRequest<ShippingMethod>("/v6/merchant/shop/shipping-methods", {
      method: "POST",
      body: data,
    }),

  update: (id: number, data: UpdateShippingMethodInput) =>
    adminApiRequest<ShippingMethod>(
      `/v6/merchant/shop/shipping-methods/${id}`,
      {
        method: "PATCH",
        body: data,
      },
    ),

  delete: (id: number) =>
    adminApiRequest<{ id: number }>(
      `/v6/merchant/shop/shipping-methods/${id}`,
      {
        method: "DELETE",
      },
    ),
};

// ── Payment Transactions ──

export const adminPaymentsApi = {
  listTransactions: (params?: ListParams) =>
    listResource<PaymentTransaction>(
      "/v6/merchant/payment-transactions",
      params,
    ),

  refund: (transactionId: string, data?: RefundInput) =>
    adminApiRequest<RefundResult>(
      `/v6/merchant/payment-transactions/${transactionId}/refund`,
      {
        method: "POST",
        body: data ?? {},
      },
    ),
};

// ── Membership Tiers ──

export const adminTiersApi = {
  list: (params?: ListParams) =>
    listResource<MembershipTier>("/v6/merchant/members/tiers", params),

  create: (data: CreateTierInput) =>
    adminApiRequest<MembershipTier>("/v6/merchant/members/tiers", {
      method: "POST",
      body: data,
    }),

  update: (id: number | string, data: UpdateTierInput) =>
    adminApiRequest<MembershipTier>(`/v6/merchant/members/tiers/${id}`, {
      method: "PATCH",
      body: data,
    }),

  delete: (id: number | string) =>
    adminApiRequest<{ success: boolean }>(`/v6/merchant/members/tiers/${id}`, {
      method: "DELETE",
    }),
};

// ── Promotions ──

export const adminPromotionsApi = {
  list: (params?: ListParams) =>
    listResource<Promotion>("/v6/merchant/promotions", params),

  get: (id: string) =>
    adminApiRequest<PromotionDetail>(`/v6/merchant/promotions/${id}`),

  create: (data: CreatePromotionInput) =>
    adminApiRequest<PromotionDetail>("/v6/merchant/promotions", {
      method: "POST",
      body: data,
    }),

  update: (id: string, data: UpdatePromotionInput) =>
    adminApiRequest<PromotionDetail>(`/v6/merchant/promotions/${id}`, {
      method: "PATCH",
      body: data,
    }),

  delete: (id: string) =>
    adminApiRequest<{ success: boolean }>(`/v6/merchant/promotions/${id}`, {
      method: "DELETE",
    }),

  clone: (id: string) =>
    adminApiRequest<PromotionDetail>(`/v6/merchant/promotions/${id}/clone`, {
      method: "POST",
    }),

  usages: (id: string, params?: ListParams) =>
    listResource<PromotionUsage>(
      `/v6/merchant/promotions/${id}/usages`,
      params,
    ),
};

// ── Announcements ──

export const adminAnnouncementsApi = {
  list: (params?: ListParams) =>
    listResource<Announcement>("/v6/merchant/announcements", params),

  get: (id: string) =>
    adminApiRequest<AnnouncementDetail>(`/v6/merchant/announcements/${id}`),

  create: (data: CreateAnnouncementInput) =>
    adminApiRequest<{ id: string }>("/v6/merchant/announcements", {
      method: "POST",
      body: data,
    }),

  update: (id: string, data: UpdateAnnouncementInput) =>
    adminApiRequest<{ success: boolean }>(`/v6/merchant/announcements/${id}`, {
      method: "PATCH",
      body: data,
    }),

  delete: (id: string) =>
    adminApiRequest<{ success: boolean }>(`/v6/merchant/announcements/${id}`, {
      method: "DELETE",
    }),

  uploadImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return adminApiUpload<{ featuredImage: string }>(
      `/v6/merchant/announcements/${id}/upload-image`,
      formData,
    );
  },
};

// ── Reward Schemes ──

export const adminRewardSchemesApi = {
  list: (params?: ListParams) =>
    listResource<RewardScheme>("/v6/merchant/reward-schemes", params),

  get: (id: string) =>
    adminApiRequest<RewardScheme>(`/v6/merchant/reward-schemes/${id}`),

  create: (data: CreateRewardSchemeInput) =>
    adminApiRequest<{ id: string }>("/v6/merchant/reward-schemes", {
      method: "POST",
      body: data,
    }),

  update: (id: string, data: UpdateRewardSchemeInput) =>
    adminApiRequest<{ success: boolean }>(`/v6/merchant/reward-schemes/${id}`, {
      method: "PATCH",
      body: data,
    }),

  delete: (id: string) =>
    adminApiRequest<{ success: boolean }>(`/v6/merchant/reward-schemes/${id}`, {
      method: "DELETE",
    }),

  clone: (id: string) =>
    adminApiRequest<{ id: string }>(`/v6/merchant/reward-schemes/${id}/clone`, {
      method: "POST",
    }),
};

// ── Automatic Rewards ──

export const adminAutomaticRewardsApi = {
  list: (params?: ListParams) =>
    listResource<AutomaticReward>("/v6/merchant/automatic-rewards", params),

  get: (id: string) =>
    adminApiRequest<AutomaticRewardDetail>(
      `/v6/merchant/automatic-rewards/${id}`,
    ),

  create: (data: CreateAutomaticRewardInput) =>
    adminApiRequest<{ id: string }>("/v6/merchant/automatic-rewards", {
      method: "POST",
      body: data,
    }),

  update: (id: string, data: UpdateAutomaticRewardInput) =>
    adminApiRequest<{ success: boolean }>(
      `/v6/merchant/automatic-rewards/${id}`,
      {
        method: "PATCH",
        body: data,
      },
    ),

  delete: (id: string) =>
    adminApiRequest<{ success: boolean }>(
      `/v6/merchant/automatic-rewards/${id}`,
      {
        method: "DELETE",
      },
    ),
};

// ── Gift Offers ──

export const adminGiftOffersApi = {
  list: (params?: ListParams) =>
    listResource<GiftOffer>("/v6/merchant/gift-offers", params),

  get: (id: string) =>
    adminApiRequest<GiftOfferDetail>(`/v6/merchant/gift-offers/${id}`),

  create: (data: CreateGiftOfferInput) =>
    adminApiRequest<{ id: string }>("/v6/merchant/gift-offers", {
      method: "POST",
      body: data,
    }),

  update: (id: string, data: UpdateGiftOfferInput) =>
    adminApiRequest<{ success: boolean }>(`/v6/merchant/gift-offers/${id}`, {
      method: "PATCH",
      body: data,
    }),

  delete: (id: string) =>
    adminApiRequest<{ success: boolean }>(`/v6/merchant/gift-offers/${id}`, {
      method: "DELETE",
    }),

  uploadImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return adminApiUpload<{ image: string }>(
      `/v6/merchant/gift-offers/${id}/upload-image`,
      formData,
    );
  },
};

// ── Reward Redemptions ──

export const adminRewardRedemptionsApi = {
  list: (params?: ListParams) =>
    listResource<RewardRedemption>("/v6/merchant/reward-redemptions", params),

  get: (id: string) =>
    adminApiRequest<RewardRedemption>(`/v6/merchant/reward-redemptions/${id}`),

  create: (data: CreateRewardRedemptionInput) =>
    adminApiRequest<{ id: string }>("/v6/merchant/reward-redemptions", {
      method: "POST",
      body: data,
    }),

  delete: (id: string) =>
    adminApiRequest<{ success: boolean }>(
      `/v6/merchant/reward-redemptions/${id}`,
      {
        method: "DELETE",
      },
    ),

  bulkIssue: (data: IssueRewardsInput) =>
    adminApiRequest<{ issuedCount: number; message: string }>(
      "/v6/merchant/issue-rewards",
      {
        method: "POST",
        body: data,
      },
    ),
};

// ── Loyalty ──

export const adminLoyaltyApi = {
  getSummary: (accountId: string) =>
    adminApiRequest<LoyaltySummary>(`/v6/pos/loyalty/${accountId}`),

  getTransactions: (accountId: string, limit?: number) =>
    adminApiRequest<RewardTransaction[]>(
      `/v6/pos/loyalty/${accountId}/transactions`,
      { params: limit ? { limit: String(limit) } : undefined },
    ),

  manualEarn: (accountId: string, data: ManualEarnInput) =>
    adminApiRequest<{ id: string; pointBalance: string }>(
      `/v6/pos/loyalty/${accountId}/earn`,
      { method: "POST", body: data },
    ),
};

// ── Settings ──

// ── Events ──

export interface AdminEventRegistration {
  id: string;
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  sessionStartTime: string | null;
  guestName: string;
  email: string;
  phone: string | null;
  quantity: number;
  totalAmount: string;
  currency: string;
  status: string;
  paymentRequired: boolean;
  registeredAt: string;
}

export const adminEventsApi = {
  list: (params?: ListParams) =>
    listResource<unknown>("/v6/merchant/events", params),

  get: (id: string) => adminApiRequest<unknown>(`/v6/merchant/events/${id}`),

  listRegistrations: (eventId: string, params?: ListParams) =>
    listResource<AdminEventRegistration>(
      `/v6/merchant/events/${eventId}/registrations`,
      params,
    ),
};

export interface AnalyticsConfig {
  gtmId: string | null;
  ga4Id: string | null;
  metaPixelId: string | null;
}

export interface CompanyProfile {
  id: string | number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  logoUrl?: string | null;
  logo_url?: string | null;
  industry?: string | null;
  timezone?: string | null;
}

export const adminSettingsApi = {
  getProfile: () =>
    adminApiRequest<CompanyProfile>("/v6/merchant/settings/profile"),

  updateProfile: (data: Partial<CompanyProfile>) =>
    adminApiRequest<CompanyProfile>("/v6/merchant/settings/profile", {
      method: "PATCH",
      body: data,
    }),

  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append("logo", file);
    return adminApiUpload<{ logo_url: string }>(
      "/v6/merchant/settings/profile/logo",
      formData,
    );
  },

  getAnalytics: () =>
    adminApiRequest<AnalyticsConfig>("/v6/merchant/settings/analytics"),

  getBookingConfig: () =>
    adminApiRequest<BookingConfig>("/v6/merchant/settings/booking"),

  updateBookingConfig: (data: Partial<BookingConfig>) =>
    adminApiRequest<BookingConfig>("/v6/merchant/settings/booking", {
      method: "PATCH",
      body: data,
    }),

  getLoginChannel: () =>
    adminApiRequest<LoginChannelConfig>(
      "/v6/merchant/settings/customer-portal-login",
    ),

  updateLoginChannel: (data: { channel: string }) =>
    adminApiRequest<LoginChannelConfig>(
      "/v6/merchant/settings/customer-portal-login",
      {
        method: "PATCH",
        body: data,
      },
    ),

  updateAnalytics: (data: Partial<AnalyticsConfig>) =>
    adminApiRequest<AnalyticsConfig>("/v6/merchant/settings/analytics", {
      method: "PATCH",
      body: data,
    }),
};

export interface BookingConfig {
  allowMemberCancellation?: boolean;
  memberCancellationCutoffHours?: number | null;
  globalCooldownDays?: number | null;
  cooldownMessage?: string | null;
  blockUntilFinished?: boolean;
}

export interface LoginChannelConfig {
  channel: "whatsapp" | "sms" | "email";
  smsBalance?: number;
  smsBalanceLow?: boolean;
}

// --- CMS/BLOG API ---
export const adminBlogApi = {
  list: (params?: ListParams) =>
    listResource<import("$lib/types/admin").BlogPostAdmin>(
      "/v6/merchant/cms/posts",
      params,
    ),

  get: (id: string) =>
    adminApiRequest<import("$lib/types/admin").BlogPostDetailAdmin>(
      `/v6/merchant/cms/posts/${id}`,
    ),

  create: (data: import("$lib/types/admin").CreateBlogPostInput) =>
    adminApiRequest<{ id: string; slug: string }>("/v6/merchant/cms/posts", {
      method: "POST",
      body: { ...data, type: data.type || "blog_post" },
    }),

  update: (id: string, data: import("$lib/types/admin").UpdateBlogPostInput) =>
    adminApiRequest<{ id: string }>(`/v6/merchant/cms/posts/${id}`, {
      method: "PATCH",
      body: data,
    }),

  delete: (id: string) =>
    adminApiRequest<{ success: boolean }>(`/v6/merchant/cms/posts/${id}`, {
      method: "DELETE",
    }),

  uploadImage: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return adminApiRequest<{ featuredImage: string }>(
      `/v6/merchant/cms/posts/${id}/upload-image`,
      {
        method: "POST",
        body: formData,
      },
    );
  },
};
