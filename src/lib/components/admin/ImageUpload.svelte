<script lang="ts">
  import { adminProductsApi } from "$lib/api/admin";
  import type { ProductImage } from "$lib/types/admin";
  import { Upload, Star, Trash2, Loader2 } from "lucide-svelte";

  interface Props {
    productId: number;
    images: ProductImage[];
    onChanged: () => void;
  }

  let { productId, images, onChanged }: Props = $props();

  let uploading = $state(false);
  let uploadError = $state("");
  let dragging = $state(false);
  let actionLoading = $state<number | null>(null);

  let fileInput: HTMLInputElement;

  const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const MAX_SIZE = 10 * 1024 * 1024;

  function validateFile(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) return "Only JPEG, PNG, WebP, and GIF images are allowed.";
    if (file.size > MAX_SIZE) return "Image must be under 10MB.";
    return null;
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    const err = validateFile(file);
    if (err) {
      uploadError = err;
      return;
    }

    uploading = true;
    uploadError = "";
    try {
      await adminProductsApi.uploadImage(productId, file);
      onChanged();
    } catch (err: unknown) {
      uploadError = err instanceof Error ? err.message : "Upload failed";
    } finally {
      uploading = false;
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragging = false;
    handleFiles(e.dataTransfer?.files ?? null);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    dragging = true;
  }

  async function setPrimary(imageId: number) {
    actionLoading = imageId;
    try {
      await adminProductsApi.updateImage(productId, imageId, { isPrimary: true });
      onChanged();
    } catch {
      uploadError = "Failed to set primary image";
    } finally {
      actionLoading = null;
    }
  }

  async function deleteImage(imageId: number) {
    actionLoading = imageId;
    try {
      await adminProductsApi.deleteImage(productId, imageId);
      onChanged();
    } catch {
      uploadError = "Failed to delete image";
    } finally {
      actionLoading = null;
    }
  }
</script>

<div class="bg-white rounded-lg border border-gray-200 p-4">
  <h2 class="font-medium text-gray-900 mb-3">Images</h2>

  {#if uploadError}
    <div class="p-2 bg-red-50 text-red-700 rounded text-xs mb-3">{uploadError}</div>
  {/if}

  <!-- Existing images -->
  {#if images.length > 0}
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
      {#each images as image (image.id)}
        <div class="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
          <img src={image.src} alt={image.alt ?? ""} class="w-full h-full object-cover" />
          {#if image.isPrimary}
            <span class="absolute top-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded">
              Primary
            </span>
          {/if}
          <!-- Actions overlay -->
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-center gap-1 p-2 opacity-0 group-hover:opacity-100">
            {#if !image.isPrimary}
              <button
                onclick={() => setPrimary(image.id)}
                disabled={actionLoading === image.id}
                class="p-1.5 bg-white rounded-md text-gray-700 hover:text-blue-600 text-xs"
                title="Set as primary"
              >
                <Star class="w-3.5 h-3.5" />
              </button>
            {/if}
            <button
              onclick={() => deleteImage(image.id)}
              disabled={actionLoading === image.id}
              class="p-1.5 bg-white rounded-md text-gray-700 hover:text-red-600 text-xs"
              title="Delete"
            >
              {#if actionLoading === image.id}
                <Loader2 class="w-3.5 h-3.5 animate-spin" />
              {:else}
                <Trash2 class="w-3.5 h-3.5" />
              {/if}
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Upload zone -->
  <button
    type="button"
    onclick={() => fileInput.click()}
    ondrop={handleDrop}
    ondragover={handleDragOver}
    ondragleave={() => (dragging = false)}
    class="w-full border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
      {dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}"
    disabled={uploading}
  >
    {#if uploading}
      <Loader2 class="w-6 h-6 text-gray-400 mx-auto animate-spin" />
      <p class="text-xs text-gray-500 mt-2">Uploading...</p>
    {:else}
      <Upload class="w-6 h-6 text-gray-400 mx-auto" />
      <p class="text-xs text-gray-500 mt-2">Click or drag to upload</p>
      <p class="text-xs text-gray-400 mt-0.5">JPEG, PNG, WebP, GIF &middot; Max 10MB</p>
    {/if}
  </button>

  <input
    bind:this={fileInput}
    type="file"
    accept="image/jpeg,image/png,image/webp,image/gif"
    class="hidden"
    onchange={(e) => handleFiles((e.target as HTMLInputElement).files)}
  />
</div>
