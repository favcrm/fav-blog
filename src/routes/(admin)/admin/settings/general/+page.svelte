<script lang="ts">
  import { onMount } from 'svelte';
  import { adminSettingsApi, type BookingConfig, type LoginChannelConfig, type CompanyProfile } from '$lib/api/admin';
  import { Settings, Loader2, Save, CheckCircle2, ShieldAlert, Key, Upload, Store } from 'lucide-svelte';

  let profile = $state<CompanyProfile | null>(null);
  let bookingConfig = $state<BookingConfig>({ allowMemberCancellation: true, memberCancellationCutoffHours: null });
  let loginChannel = $state<LoginChannelConfig>({ channel: 'email' });
  let loading = $state(true);
  let saving = $state(false);
  let uploadingLogo = $state(false);
  let error = $state('');
  let success = $state(false);

  // Form fields
  let companyName = $state('');
  let companyEmail = $state('');
  let companyPhone = $state('');
  let companyAddress = $state('');
  let companyWebsite = $state('');
  
  let allowMemberCancellation = $state(true);
  let cutoffHours = $state<string>('');
  let channel = $state<'whatsapp' | 'sms' | 'email'>('email');

  let fileInput = $state<HTMLInputElement | null>(null);

  onMount(async () => {
    try {
      const [profileRes, bookingRes, loginRes] = await Promise.all([
        adminSettingsApi.getProfile(),
        adminSettingsApi.getBookingConfig(),
        adminSettingsApi.getLoginChannel()
      ]);
      
      profile = profileRes;
      companyName = profile.name ?? '';
      companyEmail = profile.email ?? '';
      companyPhone = profile.phone ?? '';
      companyAddress = profile.address ?? '';
      companyWebsite = profile.website ?? '';
      
      bookingConfig = bookingRes;
      allowMemberCancellation = bookingConfig.allowMemberCancellation ?? true;
      cutoffHours = bookingConfig.memberCancellationCutoffHours?.toString() ?? '';
      
      loginChannel = loginRes;
      channel = loginChannel.channel ?? 'email';
    } catch {
      error = 'Failed to load settings';
    } finally {
      loading = false;
    }
  });

  async function handleLogoUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    
    uploadingLogo = true;
    error = '';
    
    try {
      const res = await adminSettingsApi.uploadLogo(file);
      if (profile) {
        profile.logo_url = res.logo_url;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to upload logo';
    } finally {
      uploadingLogo = false;
      if (fileInput) fileInput.value = '';
    }
  }

  async function handleSave() {
    saving = true;
    error = '';
    success = false;
    try {
      const [profileRes, bookingRes, loginRes] = await Promise.all([
        adminSettingsApi.updateProfile({
          name: companyName.trim(),
          email: companyEmail.trim() || null,
          phone: companyPhone.trim() || null,
          address: companyAddress.trim() || null,
          website: companyWebsite.trim() || null,
        }),
        adminSettingsApi.updateBookingConfig({
          allowMemberCancellation,
          memberCancellationCutoffHours: cutoffHours ? parseInt(cutoffHours, 10) : null,
        }),
        adminSettingsApi.updateLoginChannel({
          channel
        })
      ]);
      
      profile = profileRes;
      bookingConfig = bookingRes;
      loginChannel = loginRes;
      
      success = true;
      setTimeout(() => { success = false; }, 3000);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to save settings';
    } finally {
      saving = false;
    }
  }
</script>

<div class="mb-8">
  <div class="flex items-center gap-3 mb-2">
    <div class="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
      <Settings class="w-4 h-4 text-slate-300" />
    </div>
    <h1 class="text-xl font-semibold text-gray-900">General Settings</h1>
  </div>
  <p class="text-sm text-gray-500 ml-11">
    Configure company profile, authentication, and booking policies.
  </p>
</div>

{#if loading}
  <div class="flex items-center gap-3 py-12 text-gray-400">
    <Loader2 class="w-5 h-5 animate-spin" />
    <span class="text-sm">Loading…</span>
  </div>
{:else}
  <div class="bg-white border border-gray-200 rounded-xl overflow-hidden mb-8">
    <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
      <h2 class="text-sm font-semibold text-gray-700">Company Profile</h2>
    </div>

    <div class="p-6 space-y-6">
      <div class="flex items-start gap-6">
        <div class="flex flex-col items-center gap-3">
          <div class="w-20 h-20 bg-gray-100 border border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
            {#if profile?.logo_url || profile?.logoUrl}
              <img src={profile.logo_url || profile.logoUrl} alt="Logo" class="w-full h-full object-contain" />
            {:else}
              <Store class="w-8 h-8 text-gray-300" />
            {/if}
          </div>
          <input 
            type="file" 
            accept="image/*" 
            class="hidden" 
            bind:this={fileInput}
            onchange={handleLogoUpload}
          />
          <button 
            type="button"
            disabled={uploadingLogo}
            onclick={() => fileInput?.click()}
            class="text-xs font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50 flex items-center gap-1.5"
          >
            {#if uploadingLogo}
              <Loader2 class="w-3 h-3 animate-spin" />
              Uploading
            {:else}
              <Upload class="w-3 h-3" />
              Change Logo
            {/if}
          </button>
        </div>
        
        <div class="flex-1 space-y-4">
          <div>
            <label for="company-name" class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Company Name</label>
            <input id="company-name" type="text" bind:value={companyName} class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-400 transition-all" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="company-email" class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Support Email</label>
              <input id="company-email" type="email" bind:value={companyEmail} class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-400 transition-all" />
            </div>
            <div>
              <label for="company-phone" class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Support Phone</label>
              <input id="company-phone" type="tel" bind:value={companyPhone} class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-400 transition-all" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="company-website" class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Website</label>
              <input id="company-website" type="url" bind:value={companyWebsite} class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-400 transition-all" />
            </div>
            <div>
              <label for="company-address" class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Address</label>
              <input id="company-address" type="text" bind:value={companyAddress} class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-400 transition-all" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
      <h2 class="text-sm font-semibold text-gray-700">Authentication & Policies</h2>
    </div>

    <div class="p-6 space-y-6">
      <!-- Auth Channel -->
      <div>
        <label for="auth-channel" class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
          Customer Login Channel
        </label>
        <div class="flex items-center gap-3">
          <Key class="w-5 h-5 text-gray-400" />
          <select
            id="auth-channel"
            bind:value={channel}
            class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-400 transition-all"
          >
            <option value="whatsapp" disabled>WhatsApp OTP</option>
            <option value="sms" disabled>SMS OTP</option>
            <option value="email">Email OTP</option>
          </select>
        </div>
        <p class="mt-1.5 text-xs text-gray-400 ml-8">Choose how customers receive their one-time passwords.</p>
      </div>

      <hr class="border-gray-100" />

      <!-- Booking Policies -->
      <div class="space-y-4">
        <h3 class="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Booking Policies
        </h3>
        
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <ShieldAlert class="w-5 h-5 text-gray-400" />
            <div>
              <p class="text-sm font-medium text-gray-900">Allow Member Cancellation</p>
              <p class="text-xs text-gray-500">Let customers cancel bookings via the portal</p>
            </div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" bind:checked={allowMemberCancellation} class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {#if allowMemberCancellation}
          <div class="pl-8">
            <label for="cutoff-hours" class="block text-xs font-medium text-gray-700 mb-1">
              Cancellation Cutoff (Hours before start)
            </label>
            <input
              id="cutoff-hours"
              type="number"
              min="0"
              bind:value={cutoffHours}
              placeholder="e.g. 24"
              class="w-32 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-400 transition-all"
            />
            <p class="mt-1 text-xs text-gray-400">Leave blank for no cutoff.</p>
          </div>
        {/if}
      </div>

      {#if error}
        <p class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 mt-4">{error}</p>
      {/if}

      <!-- Actions -->
      <div class="flex items-center justify-between pt-6 border-t border-gray-100">
        <div class="flex items-center gap-2 text-sm text-emerald-600 transition-all duration-300"
             class:opacity-0={!success}
             class:opacity-100={success}>
          <CheckCircle2 class="w-4 h-4" />
          <span>Saved</span>
        </div>
        <button
          onclick={handleSave}
          disabled={saving}
          class="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed
                 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {#if saving}
            <Loader2 class="w-4 h-4 animate-spin" />
            Saving…
          {:else}
            <Save class="w-4 h-4" />
            Save Changes
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
