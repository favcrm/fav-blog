import type { RequestHandler } from "./$types";
import { authorizationServerUrl } from "$lib/mcp/favcrm-server";

export const GET: RequestHandler = async ({ url }) =>
  Response.json(
    {
      resource: `${url.origin}/mcp`,
      authorization_servers: [authorizationServerUrl()],
      bearer_methods_supported: ["header"],
      resource_documentation: `${url.origin}/llms.txt`,
      scopes_supported: [
        "customer",
        "customer:bookings",
        "customer:orders",
        "customer:invoices",
      ],
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
