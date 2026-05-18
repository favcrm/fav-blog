/**
 * Server actions for the in-app FavCRM workspace registration flow.
 *
 * Uses the no-auth developer endpoints:
 *   POST /v6/dev/signup  { email }        → emails a 6-digit code
 *   POST /v6/dev/verify  { email, otp }   → { apiKey, companyId, mcpEndpoint }
 *
 * Calls run server-side so the browser never hits the API cross-origin and the
 * returned API key is handled on the server boundary.
 */
import { fail } from "@sveltejs/kit";
import { FAVCRM_API_URL } from "$lib/config";
import { unwrapApiResponse } from "$lib/api-envelope";
import type { Actions } from "./$types";

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.json()) as { error?: { message?: string } };
    return body?.error?.message ?? fallback;
  } catch {
    return fallback;
  }
}

export const actions: Actions = {
  request: async ({ request, fetch }) => {
    const form = await request.formData();
    const email = String(form.get("email") ?? "")
      .trim()
      .toLowerCase();

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return fail(400, {
        step: "email",
        error: "Enter a valid email address.",
      });
    }

    const res = await fetch(`${FAVCRM_API_URL}/v6/dev/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      return fail(res.status, {
        step: "email",
        email,
        error: await readError(
          res,
          "Could not start signup. Please try again.",
        ),
      });
    }

    return { step: "otp" as const, email };
  },

  verify: async ({ request, fetch, url }) => {
    const form = await request.formData();
    const email = String(form.get("email") ?? "")
      .trim()
      .toLowerCase();
    const otp = String(form.get("otp") ?? "").trim();

    // The deployment's own hostname — registered as a storefront domain so the
    // site resolves its workspace without a companyId env var. Skipped for
    // local hosts (a `localhost` domain row would be useless).
    const hostname = url.hostname.toLowerCase();
    const isLocalHost = ["localhost", "127.0.0.1", "0.0.0.0"].includes(
      hostname,
    );

    if (!email) {
      return fail(400, { step: "email", error: "Start over — email missing." });
    }
    if (!/^\d{6}$/.test(otp)) {
      return fail(400, {
        step: "otp",
        email,
        error: "Enter the 6-digit code from your email.",
      });
    }

    const res = await fetch(`${FAVCRM_API_URL}/v6/dev/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        otp,
        ...(isLocalHost ? {} : { hostname }),
      }),
    });

    if (!res.ok) {
      return fail(res.status, {
        step: "otp",
        email,
        error: await readError(res, "Invalid or expired code."),
      });
    }

    const result = unwrapApiResponse<{
      apiKey: string;
      companyId: string;
      mcpEndpoint: string;
      domainRegistered?: boolean;
    }>(await res.json());

    return {
      step: "done" as const,
      email,
      companyId: result.companyId,
      apiKey: result.apiKey,
      mcpEndpoint: result.mcpEndpoint,
      hostname,
      isLocalHost,
      domainRegistered: result.domainRegistered ?? false,
    };
  },
};
