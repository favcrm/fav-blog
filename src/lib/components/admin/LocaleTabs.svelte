<script lang="ts">
  import type { Translations, TranslationFields } from "$lib/types/admin";
  import Input from "$lib/components/ui/Input.svelte";

  /**
   * LocaleTabs — Edit translations for an entity.
   *
   * The "default" name/description live on the entity itself (en-US base).
   * This component manages the zh-HK translation stored in `translations["zh-HK"]`.
   */

  const LOCALES = [
    { code: "en-US", label: "English (Default)" },
    { code: "zh-HK", label: "繁體中文" },
  ] as const;

  interface Props {
    /** Current translations object from the entity */
    translations: Translations;
    /** Callback when translations change */
    onchange: (translations: Translations) => void;
    /** Whether to show description field (default: true) */
    showDescription?: boolean;
    /** Base name (en-US default, read-only display) */
    baseName?: string;
    /** Base description (en-US default, read-only display) */
    baseDescription?: string;
  }

  let {
    translations,
    onchange,
    showDescription = true,
    baseName = "",
    baseDescription = "",
  }: Props = $props();

  let activeTab = $state<string>("zh-HK");

  let zhName = $state("");
  let zhDescription = $state("");

  // Sync from parent when translations prop changes (e.g. on load)
  $effect(() => {
    zhName = translations?.["zh-HK"]?.name ?? "";
    zhDescription = translations?.["zh-HK"]?.description ?? "";
  });

  function emitChange() {
    const updated: Translations = { ...translations };
    const fields: TranslationFields = {};
    if (zhName.trim()) fields.name = zhName.trim();
    if (zhDescription.trim()) fields.description = zhDescription.trim();

    if (Object.keys(fields).length > 0) {
      updated["zh-HK"] = fields;
    } else {
      delete updated["zh-HK"];
    }
    onchange(updated);
  }
</script>

<div class="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="font-medium text-gray-900">Translations</h2>
    <div class="flex rounded-md border border-gray-200 text-sm overflow-hidden">
      {#each LOCALES as locale (locale.code)}
        <button
          type="button"
          class="px-3 py-1 transition-colors {activeTab === locale.code
            ? 'bg-gray-900 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'}"
          onclick={() => (activeTab = locale.code)}
        >
          {locale.label}
        </button>
      {/each}
    </div>
  </div>

  {#if activeTab === "en-US"}
    <!-- Show base (default) values as read-only reference -->
    <div class="space-y-3">
      <div>
        <p class="block text-sm font-medium text-gray-500 mb-1">Name (default)</p>
        <p class="text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2">
          {baseName || "—"}
        </p>
      </div>
      {#if showDescription}
        <div>
          <p class="block text-sm font-medium text-gray-500 mb-1">Description (default)</p>
          <p class="text-sm text-gray-900 bg-gray-50 rounded-md px-3 py-2 whitespace-pre-wrap min-h-[2.5rem]">
            {baseDescription || "—"}
          </p>
        </div>
      {/if}
      <p class="text-xs text-gray-400">
        Default values are edited in the fields above.
      </p>
    </div>
  {:else}
    <!-- zh-HK translation inputs -->
    <div class="space-y-3">
      <Input
        name="zhName"
        label="名稱 (Name)"
        bind:value={zhName}
        placeholder="Chinese translation"
        oninput={emitChange}
      />
      {#if showDescription}
        <div class="space-y-1">
          <label for="zhDescription" class="form-label">描述 (Description)</label>
          <textarea
            id="zhDescription"
            bind:value={zhDescription}
            rows="4"
            placeholder="Chinese translation"
            class="form-input text-sm"
            oninput={emitChange}
          ></textarea>
        </div>
      {/if}
    </div>
  {/if}
</div>
