import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    // Allow local test hostnames so the domain-based workspace flow can be
    // exercised in dev. `.test` / `.localhost` are RFC-reserved for local use;
    // `.lvh.me` is public DNS that resolves to 127.0.0.1. A leading dot also
    // matches subdomains (e.g. `blog.test`). Dev-server only — no effect on build.
    allowedHosts: [".test", ".localhost", ".lvh.me"],
  },
});
