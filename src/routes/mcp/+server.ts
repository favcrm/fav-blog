import type { RequestHandler } from "./$types";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import {
  authorizationServerUrl,
  createAuthInfo,
  createFavCrmMcpServer,
} from "$lib/mcp/favcrm-server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Authorization, Content-Type, Last-Event-ID, mcp-protocol-version, mcp-session-id",
  "Access-Control-Expose-Headers":
    "mcp-protocol-version, mcp-session-id, WWW-Authenticate",
};

function bearerToken(request: Request): string | undefined {
  const header = request.headers.get("authorization");
  const match = /^Bearer\s+(.+)$/i.exec(header ?? "");
  return match?.[1]?.trim() || undefined;
}

function withCors(response: Response): Response {
  for (const [key, value] of Object.entries(corsHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

async function handleMcp({
  request,
  fetch,
  url,
  locals,
}: Parameters<RequestHandler>[0]) {
  const token = bearerToken(request);
  const ctx = {
    fetch,
    companyId: locals.companyId,
    origin: url.origin,
    token,
  };
  const server = createFavCrmMcpServer(ctx);
  const transport = new WebStandardStreamableHTTPServerTransport({
    enableJsonResponse: true,
  });

  await server.connect(transport);

  const response = await transport.handleRequest(request, {
    authInfo: createAuthInfo(ctx),
  });
  if (response.status === 401 || response.status === 403) {
    response.headers.set(
      "WWW-Authenticate",
      `Bearer resource_metadata="${url.origin}/.well-known/oauth-protected-resource"`,
    );
  }
  return withCors(response);
}

export const OPTIONS: RequestHandler = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

export const POST: RequestHandler = handleMcp;
export const GET: RequestHandler = handleMcp;
export const DELETE: RequestHandler = handleMcp;

export const HEAD: RequestHandler = async ({ url }) =>
  new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      Link: `<${url.origin}/.well-known/oauth-protected-resource>; rel="oauth-protected-resource"`,
      "WWW-Authenticate": `Bearer resource_metadata="${url.origin}/.well-known/oauth-protected-resource", authorization_uri="${authorizationServerUrl()}"`,
    },
  });
