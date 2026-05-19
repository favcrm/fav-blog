import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import * as z from "zod/v4";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { FAVCRM_API_URL, type ProviderContext } from "$lib/config";
import { createFavCRM } from "$lib/favcrm";
import { listPosts, getPost } from "$lib/data/provider";
import { fetchTenantConfig } from "$lib/tenant";
import { blocksToMarkdown } from "$lib/utils/markdown";

type McpContext = ProviderContext & {
  origin: string;
  token?: string;
};

const optionalString = z.string().trim().optional();

function text(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

function json(data: unknown) {
  return text(JSON.stringify(data, null, 2));
}

function sdk(ctx: McpContext) {
  const client = createFavCRM(ctx);
  if (ctx.token) client.setToken(ctx.token);
  return client;
}

function requireToken(ctx: McpContext): string {
  if (!ctx.token) {
    throw new McpError(
      ErrorCode.InvalidRequest,
      "Customer authentication is required. Connect with a FavCRM customer bearer token.",
    );
  }
  return ctx.token;
}

function authInfo(ctx: McpContext): AuthInfo | undefined {
  if (!ctx.token) return undefined;
  return {
    token: ctx.token,
    clientId: "favcrm-customer-agent",
    scopes: ["customer"],
    resource: new URL(`${ctx.origin}/mcp`),
  };
}

export function createFavCrmMcpServer(ctx: McpContext): McpServer {
  const server = new McpServer(
    {
      name: "favcrm-template-mcp",
      version: "0.1.0",
    },
    {
      instructions:
        "Use this server to read public FavCRM storefront content and perform customer-authorized actions for this workspace. Merchant admin APIs are intentionally not exposed.",
    },
  );

  server.registerResource(
    "workspace_profile",
    "favcrm://workspace/profile",
    {
      title: "Workspace profile",
      description: "Public brand profile for the resolved FavCRM workspace.",
      mimeType: "application/json",
    },
    async (uri) => {
      const tenant = await fetchTenantConfig(ctx);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(tenant, null, 2),
          },
        ],
      };
    },
  );

  server.registerResource(
    "blog_posts",
    "favcrm://blog/posts",
    {
      title: "Blog posts",
      description: "Published posts available to this workspace.",
      mimeType: "application/json",
    },
    async (uri) => {
      const result = await listPosts({ limit: 30 }, ctx);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  server.registerResource(
    "blog_post",
    new ResourceTemplate("favcrm://blog/posts/{slug}", {
      list: async () => {
        const result = await listPosts({ limit: 30 }, ctx);
        return {
          resources: result.items
            .filter((post) => post.slug)
            .map((post) => ({
              name: post.title,
              uri: `favcrm://blog/posts/${post.slug}`,
              mimeType: "text/markdown",
              description: post.excerpt ?? undefined,
            })),
        };
      },
    }),
    {
      title: "Blog post",
      description: "Markdown rendering of a single published post.",
      mimeType: "text/markdown",
    },
    async (uri, variables) => {
      const slug = String(variables.slug ?? "");
      const post = await getPost(slug, ctx);
      if (!post)
        throw new McpError(ErrorCode.InvalidParams, `Post not found: ${slug}`);

      const date = post.publishedAt ?? post.createdAt;
      const markdown = `# ${post.title}

Published: ${date}
Original URL: ${ctx.origin}/blog/${post.slug}

${blocksToMarkdown(post.blocks)}
`;
      return {
        contents: [
          { uri: uri.href, mimeType: "text/markdown", text: markdown },
        ],
      };
    },
  );

  server.registerTool(
    "search_blog",
    {
      title: "Search blog",
      description: "Search published blog posts and return matching summaries.",
      inputSchema: {
        query: optionalString.describe(
          "Search text. Leave empty to list recent posts.",
        ),
        category: optionalString.describe("Optional category slug."),
        limit: z.number().int().min(1).max(30).optional(),
      },
    },
    async ({ query, category, limit }) => {
      const result = await listPosts(
        { search: query, category, limit: limit ?? 10 },
        ctx,
      );
      return json(result);
    },
  );

  server.registerTool(
    "list_products",
    {
      title: "List products",
      description: "List public shop products for the workspace.",
      inputSchema: {
        search: optionalString,
        category_slug: optionalString,
        sort: z.enum(["name", "price_asc", "price_desc", "newest"]).optional(),
        limit: z.number().int().min(1).max(50).optional(),
      },
    },
    async (args) => json(await sdk(ctx).shop.listProducts(args)),
  );

  server.registerTool(
    "get_product",
    {
      title: "Get product",
      description: "Fetch public product details by slug.",
      inputSchema: { slug: z.string().trim().min(1) },
    },
    async ({ slug }) => json(await sdk(ctx).shop.getProduct(slug)),
  );

  server.registerTool(
    "list_booking_services",
    {
      title: "List booking services",
      description: "List public services that can be booked.",
      inputSchema: {},
    },
    async () => json(await sdk(ctx).bookings.listServices()),
  );

  server.registerTool(
    "get_booking_slots",
    {
      title: "Get booking slots",
      description: "List available booking slots for a service and date.",
      inputSchema: {
        serviceId: z.string().trim().min(1),
        date: z.string().trim().min(1).describe("Date in YYYY-MM-DD format."),
        staffId: optionalString,
        resourceId: optionalString,
        createQuotes: z.boolean().optional(),
      },
    },
    async ({ serviceId, date, staffId, resourceId, createQuotes }) =>
      json(
        await sdk(ctx).bookings.getTimeSlots(serviceId, {
          date,
          staffId,
          resourceId,
          createQuotes,
        }),
      ),
  );

  server.registerTool(
    "list_my_bookings",
    {
      title: "List my bookings",
      description: "List bookings for the authenticated customer.",
      inputSchema: {
        upcoming: z.enum(["true", "false"]).optional(),
        status: optionalString,
        limit: optionalString,
      },
    },
    async (args) => {
      requireToken(ctx);
      return json(await sdk(ctx).bookings.list(args));
    },
  );

  server.registerTool(
    "list_my_orders",
    {
      title: "List my orders",
      description: "List shop orders for the authenticated customer.",
      inputSchema: {},
    },
    async () => {
      requireToken(ctx);
      return json(await sdk(ctx).shop.listOrders());
    },
  );

  server.registerTool(
    "list_my_invoices",
    {
      title: "List my invoices",
      description: "List invoices for the authenticated customer.",
      inputSchema: {},
    },
    async () => {
      requireToken(ctx);
      return json(await sdk(ctx).invoices.list());
    },
  );

  server.registerTool(
    "create_contact_enquiry",
    {
      title: "Create contact enquiry",
      description: "Submit a customer enquiry to the workspace inbox.",
      inputSchema: {
        name: z.string().trim().min(1),
        email: z.string().trim().email(),
        phone: optionalString,
        subject: optionalString,
        message: z.string().trim().min(1),
      },
    },
    async (input) => json(await sdk(ctx).contact.submit(input)),
  );

  server.registerTool(
    "create_guest_booking",
    {
      title: "Create guest booking",
      description: "Create a booking request from a selected service slot.",
      inputSchema: {
        serviceId: z.string().trim().min(1),
        bookingDate: z.string().trim().min(1),
        startTime: z.string().trim().min(1),
        endTime: z.string().trim().min(1),
        scheduleId: optionalString,
        staffId: optionalString,
        resourceId: optionalString,
        quoteId: optionalString,
        notes: optionalString,
        addonIds: z.array(z.string().trim().min(1)).optional(),
      },
    },
    async (input) => json(await sdk(ctx).bookings.createGuest(input)),
  );

  server.registerTool(
    "create_order",
    {
      title: "Create order",
      description:
        "Create a shop order for the current customer or supplied customer details.",
      inputSchema: {
        lineItems: z
          .array(
            z.object({
              productId: z.number().int().positive(),
              quantity: z.number().int().positive(),
              variationId: z.number().int().positive().optional(),
            }),
          )
          .min(1),
        customerInfo: z.object({
          firstName: z.string().trim().min(1),
          lastName: z.string().trim().min(1),
          email: optionalString,
          phone: optionalString,
        }),
        shippingAddress: z.object({
          addressLine1: z.string().trim().min(1),
          addressLine2: optionalString,
          city: z.string().trim().min(1),
          state: optionalString,
          zipCode: optionalString,
          country: optionalString,
        }),
        shippingMethodId: z.number().int().positive().optional(),
        promotionCode: optionalString,
        paymentMethodId: optionalString,
        successUrl: optionalString,
        cancelUrl: optionalString,
      },
    },
    async (input) => json(await sdk(ctx).shop.createOrder(input)),
  );

  server.registerTool(
    "cancel_my_booking",
    {
      title: "Cancel my booking",
      description: "Cancel one booking owned by the authenticated customer.",
      inputSchema: {
        bookingId: z.string().trim().min(1),
        reason: optionalString,
      },
    },
    async ({ bookingId, reason }) => {
      requireToken(ctx);
      return json(await sdk(ctx).bookings.cancel(bookingId, reason));
    },
  );

  server.registerTool(
    "reschedule_my_booking",
    {
      title: "Reschedule my booking",
      description:
        "Reschedule one booking owned by the authenticated customer.",
      inputSchema: {
        bookingId: z.string().trim().min(1),
        bookingDate: z.string().trim().min(1),
        startTime: z.string().trim().min(1),
        endTime: z.string().trim().min(1),
        staffId: z.string().trim().nullable().optional(),
        resourceId: z.string().trim().nullable().optional(),
        notes: z.string().trim().nullable().optional(),
      },
    },
    async ({ bookingId, ...input }) => {
      requireToken(ctx);
      return json(await sdk(ctx).bookings.reschedule(bookingId, input));
    },
  );

  return server;
}

export function createAuthInfo(ctx: McpContext): AuthInfo | undefined {
  return authInfo(ctx);
}

export function authorizationServerUrl(): string {
  return FAVCRM_API_URL;
}
