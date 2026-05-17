import { get } from "svelte/store";
import { adminAuthStore, adminLogout } from "$lib/stores/admin-auth";
import {
  adminPaymentMethodsApi,
  adminShippingMethodsApi,
} from "$lib/api/admin";
import { ApiError } from "$lib/types/api";
import { unwrapApiResponse } from "./unwrap";

const API_URL = (
  (import.meta.env.VITE_API_URL as string | undefined) ??
  (import.meta.env.VITE_FAVCRM_API_URL as string | undefined) ??
  "https://api.favcrm.io"
).replace(/\/$/, "");

async function post<T>(path: string, body: unknown): Promise<T> {
  const auth = get(adminAuthStore);
  if (!auth.jwt) throw new ApiError(401, "Not authenticated");

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.jwt}`,
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    adminLogout();
    throw new ApiError(401, "Unauthorized");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    const msg =
      (err && typeof err === "object" && "error" in err
        ? (err as { error?: { message?: string } }).error?.message
        : undefined) ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, msg);
  }

  const json = await res.json();
  return unwrapApiResponse<T>(json);
}

// ── Demo content ──────────────────────────────────────────────────────

const CATEGORIES: Array<{ name: string; description: string }> = [
  { name: "Apparel", description: "Soft goods, ready-to-wear staples." },
  { name: "Accessories", description: "Small leather goods and hardware." },
  { name: "Home", description: "Objects for the well-considered interior." },
];

interface ProductSeed {
  name: string;
  price: string;
  description: string;
  sku: string;
  stockQuantity: number;
  categoryName: string;
  imageUrl: string;
  discountPrice?: string;
  isFeatured?: boolean;
}

const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1200&q=75&auto=format&fit=crop`;

const PRODUCTS: ProductSeed[] = [
  {
    name: "Studio Tote",
    price: "78.00",
    description:
      "Heavy canvas tote with bridle leather handles. Carries a laptop, a sketchbook, and a day's groceries.",
    sku: "TOTE-01",
    stockQuantity: 25,
    isFeatured: true,
    categoryName: "Accessories",
    imageUrl: UNSPLASH("1544816155-12df9643f363"),
  },
  {
    name: "Atelier Apron",
    price: "54.00",
    description:
      "Cross-back apron in waxed cotton. Two deep front pockets, brass rivets at stress points.",
    sku: "APRON-01",
    stockQuantity: 40,
    isFeatured: true,
    categoryName: "Apparel",
    imageUrl: UNSPLASH("1556905055-8f358a7a47b2"),
  },
  {
    name: "Daily Tee",
    price: "32.00",
    description:
      "Mid-weight pima cotton, garment dyed. Cut for easy layering. Three colourways.",
    sku: "TEE-01",
    stockQuantity: 120,
    categoryName: "Apparel",
    imageUrl: UNSPLASH("1521572163474-6864f9cf17ab"),
  },
  {
    name: "Field Cap",
    price: "42.00",
    description:
      "Six-panel cap in brushed twill. Adjustable leather strap, antique brass buckle.",
    sku: "CAP-01",
    stockQuantity: 60,
    categoryName: "Accessories",
    imageUrl: UNSPLASH("1521369909029-2afed882baee"),
  },
  {
    name: "Linen Throw",
    price: "120.00",
    discountPrice: "98.00",
    description:
      "Stonewashed linen, double-needle hem. Generously sized for a sofa or the foot of a bed.",
    sku: "THROW-01",
    stockQuantity: 18,
    isFeatured: true,
    categoryName: "Home",
    imageUrl: UNSPLASH("1522771739844-6a9f6d5f14af"),
  },
  {
    name: "Stoneware Mug",
    price: "28.00",
    description:
      "Hand-thrown stoneware. Holds 12oz. Microwave-safe; please don't put it in the dishwasher.",
    sku: "MUG-01",
    stockQuantity: 80,
    categoryName: "Home",
    imageUrl: UNSPLASH("1514228742587-6b1558fcca3d"),
  },
];

const SERVICES = [
  {
    name: "Style Consultation",
    description:
      "Thirty minutes with a stylist to talk through fit, fabric, and the contents of your closet.",
    type: "one_on_one" as const,
    durationMinutes: 30,
    capacity: 1,
    price: "0.00",
    status: "active" as const,
    visibility: "public" as const,
    requiresStaff: false,
    requiresResource: false,
    paymentRequired: false,
    requiresConfirmation: false,
    requireLogin: false,
  },
  {
    name: "Tailor Fitting",
    description:
      "In-person fitting with our tailor. Bring the garment; we'll handle the chalk.",
    type: "one_on_one" as const,
    durationMinutes: 45,
    capacity: 1,
    price: "25.00",
    status: "active" as const,
    visibility: "public" as const,
    requiresStaff: false,
    requiresResource: false,
    paymentRequired: false,
    requiresConfirmation: true,
    requireLogin: false,
  },
  {
    name: "Repair Drop-off",
    description:
      "Bring damaged goods for assessment. We'll quote turnaround and price within two business days.",
    type: "one_on_one" as const,
    durationMinutes: 15,
    capacity: 1,
    price: "0.00",
    status: "active" as const,
    visibility: "public" as const,
    requiresStaff: false,
    requiresResource: false,
    paymentRequired: false,
    requiresConfirmation: false,
    requireLogin: false,
  },
  {
    name: "Group Workshop",
    description:
      "A two-hour workshop, capacity eight, on a rotating topic. Materials included.",
    type: "group" as const,
    durationMinutes: 120,
    capacity: 8,
    price: "85.00",
    status: "active" as const,
    visibility: "public" as const,
    requiresStaff: false,
    requiresResource: false,
    paymentRequired: true,
    requiresConfirmation: false,
    requireLogin: false,
  },
];

function isoOffset(daysFromNow: number, hour = 18): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function buildEvents() {
  return [
    {
      name: "Spring Trunk Show",
      description:
        "Preview the spring collection. Light refreshments. RSVP required; doors close at 8pm.",
      location: "Flagship — 12 Orchard Lane",
      status: "PUBLISHED" as const,
      ticketPrice: 0,
      visibility: "public" as const,
      deliveryMode: "in_person" as const,
      maxTicketsPerOrder: 4,
      imageUrl: UNSPLASH("1469334031218-e382a71b716b"),
      sessions: [
        {
          startTime: isoOffset(14, 18),
          endTime: isoOffset(14, 21),
          quota: 80,
          sortOrder: 0,
          allDay: false,
        },
      ],
    },
    {
      name: "Fabric & Form: A Talk",
      description:
        "An hour with our head designer on material sourcing. Q&A to follow.",
      location: "Online — link sent on confirmation",
      status: "PUBLISHED" as const,
      ticketPrice: 0,
      visibility: "public" as const,
      deliveryMode: "online" as const,
      maxTicketsPerOrder: 2,
      accessRevealPolicy: "before_start" as const,
      accessRevealMinutesBeforeStart: 30,
      imageUrl: UNSPLASH("1558618666-fcd25c85cd64"),
      sessions: [
        {
          startTime: isoOffset(7, 19),
          endTime: isoOffset(7, 20),
          quota: 200,
          sortOrder: 0,
          allDay: false,
        },
      ],
    },
    {
      name: "Mending Circle",
      description:
        "Bring a garment that needs attention. Tea, thread, and quiet company.",
      location: "Studio — 12 Orchard Lane",
      status: "PUBLISHED" as const,
      ticketPrice: 15,
      visibility: "public" as const,
      deliveryMode: "in_person" as const,
      maxTicketsPerOrder: 2,
      imageUrl: UNSPLASH("1606312619070-d48b4c652a52"),
      sessions: [
        {
          startTime: isoOffset(21, 14),
          endTime: isoOffset(21, 17),
          quota: 12,
          sortOrder: 0,
          allDay: false,
        },
      ],
    },
  ];
}

// ── Public API ────────────────────────────────────────────────────────

export interface SeedScope {
  products: boolean;
  services: boolean;
  events: boolean;
}

export interface SeedProgress {
  step: string;
  done: number;
  total: number;
}

export interface SeedResult {
  categoriesCreated: number;
  productsCreated: number;
  servicesCreated: number;
  eventsCreated: number;
  errors: string[];
}

export async function seedDemoData(
  scope: SeedScope,
  onProgress?: (progress: SeedProgress) => void,
): Promise<SeedResult> {
  const result: SeedResult = {
    categoriesCreated: 0,
    productsCreated: 0,
    servicesCreated: 0,
    eventsCreated: 0,
    errors: [],
  };

  let total = 0;
  total += 1; // Payment Method
  if (scope.products) total += CATEGORIES.length + PRODUCTS.length + 1; // +1 Shipping Method
  if (scope.services) total += SERVICES.length;
  if (scope.events) total += buildEvents().length;

  let done = 0;
  const tick = (step: string) => {
    done += 1;
    onProgress?.({ step, done, total });
  };

  try {
    const existingPayments = await adminPaymentMethodsApi.list();
    if (existingPayments.length === 0) {
      await adminPaymentMethodsApi.create({
        name: "Bank Transfer / PayMe",
        type: "bank_transfer",
        instructions:
          "Please transfer to HSBC 123-456-789 and WhatsApp the receipt.",
        isActive: true,
        bookingEnabled: true,
        shopEnabled: true,
        eventEnabled: true,
      });
    }
  } catch (err) {
    result.errors.push(
      `Payment Method: ${err instanceof Error ? err.message : "failed"}`,
    );
  }
  tick("Payment Method");

  if (scope.products) {
    const idByName = new Map<string, number>();
    for (const cat of CATEGORIES) {
      try {
        const created = await post<{ categoryId: number }>(
          "/v6/merchant/shop/categories",
          cat,
        );
        idByName.set(cat.name, created.categoryId);
        result.categoriesCreated += 1;
      } catch (err) {
        result.errors.push(
          `Category "${cat.name}": ${err instanceof Error ? err.message : "failed"}`,
        );
      }
      tick(`Category: ${cat.name}`);
    }

    for (const p of PRODUCTS) {
      try {
        const payload = { ...p } as Record<string, unknown>;
        if (payload.categoryName && typeof payload.categoryName === "string") {
          payload.categories = [idByName.get(payload.categoryName)].filter(
            Boolean,
          );
        }
        await post("/v6/merchant/shop/products", payload);
        result.productsCreated += 1;
      } catch (err) {
        result.errors.push(
          `Product "${p.name}": ${err instanceof Error ? err.message : "failed"}`,
        );
      }
      tick(`Product: ${p.name}`);
    }

    try {
      const existingShipping = await adminShippingMethodsApi.list();
      if (existingShipping.length === 0) {
        await adminShippingMethodsApi.create({
          name: "Standard Delivery",
          price: 30,
          freeShippingThreshold: 500,
          isActive: true,
          estimatedDays: "2-3 business days",
        });
      }
    } catch (err) {
      result.errors.push(
        `Shipping Method: ${err instanceof Error ? err.message : "failed"}`,
      );
    }
    tick("Shipping Method");
  }

  if (scope.services) {
    for (const s of SERVICES) {
      try {
        await post("/v6/merchant/bookings/services", s);
        result.servicesCreated += 1;
      } catch (err) {
        result.errors.push(
          `Service "${s.name}": ${err instanceof Error ? err.message : "failed"}`,
        );
      }
      tick(`Service: ${s.name}`);
    }
  }

  if (scope.events) {
    for (const e of buildEvents()) {
      try {
        await post("/v6/merchant/events", e);
        result.eventsCreated += 1;
      } catch (err) {
        result.errors.push(
          `Event "${e.name}": ${err instanceof Error ? err.message : "failed"}`,
        );
      }
      tick(`Event: ${e.name}`);
    }
  }

  return result;
}

export const seedTotals = {
  categories: CATEGORIES.length,
  products: PRODUCTS.length,
  services: SERVICES.length,
  events: buildEvents().length,
};
