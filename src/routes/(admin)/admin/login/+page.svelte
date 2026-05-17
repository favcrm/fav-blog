<script lang="ts">
  import { goto } from "$app/navigation";
  import { adminAuthApi } from "$lib/api/admin";
  import { adminLogin, isAdminAuthenticated } from "$lib/stores/admin-auth";
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import {
    firstError,
    validateEmail,
    validateRequired,
  } from "$lib/utils/form-validation";
  import { onMount } from "svelte";

  let email = $state("");
  let password = $state("");
  let error = $state("");
  let fieldErrors = $state<Record<string, string>>({});
  let loading = $state(false);

  onMount(() => {
    if ($isAdminAuthenticated) {
      goto("/admin", { replaceState: true });
    }
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = "";
    fieldErrors = {};

    const validation = firstError([
      validateEmail(email),
      validateRequired(password, "password", "Password"),
    ]);

    if (validation) {
      fieldErrors = { [validation.field]: validation.message };
      error = validation.message;
      return;
    }

    loading = true;

    try {
      const res = await adminAuthApi.login(email, password);
      adminLogin({
        jwt: res.token,
        refreshToken: res.refreshToken,
        user: res.user,
        companyName: res.company.name,
      });
      goto("/admin");
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : "Login failed";
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
  <div class="w-full max-w-sm">
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h1 class="text-lg font-semibold text-gray-900 mb-1">Admin Login</h1>
      <p class="text-sm text-gray-500 mb-6">Sign in with your merchant account</p>

      {#if error}
        <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      {/if}

      <form novalidate onsubmit={handleSubmit} class="space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          bind:value={email}
          error={fieldErrors.email}
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          bind:value={password}
          error={fieldErrors.password}
          required
        />
        <Button type="submit" variant="primary" class="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>

    <p class="mt-4 text-center text-xs text-gray-400">
      <a href="/" class="hover:text-gray-600 transition-colors">&larr; Back to site</a>
    </p>
  </div>
</div>
