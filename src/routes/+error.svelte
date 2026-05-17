<script lang="ts">
  import { page } from "$app/stores";
  import { ArrowLeft } from "lucide-svelte";
  
  const status = $derived($page.status);
  const is404 = $derived(status === 404);
  
  const title = $derived(is404 ? "Page not found" : "Server error");
  const description = $derived(
    is404 
      ? "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."
      : "An unexpected error occurred. Our team has been notified and we are looking into it."
  );
</script>

<svelte:head>
  <title>{status} - {title}</title>
</svelte:head>

<div class="error-layout">
  <div class="error-content">
    
    <!-- Abstract SVG Animation -->
    <div class="art-container">
      <svg class="abstract-art" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="var(--ink, #111)" stop-opacity="1" />
            <stop offset="100%" stop-color="var(--ink, #111)" stop-opacity="0" />
          </linearGradient>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--line, #e5e7eb)" stroke-width="0.5" />
          </pattern>
        </defs>
        
        <!-- Background Grid -->
        <rect width="200" height="200" fill="url(#grid)" class="anim-grid" />
        
        <g class="center-group">
          <!-- Outer broken ring -->
          <circle cx="100" cy="100" r="70" fill="none" stroke="var(--line, #e5e7eb)" stroke-width="1" class="anim-ring-slow" stroke-dasharray="2 6" />
          
          <!-- Middle dash ring -->
          <circle cx="100" cy="100" r="50" fill="none" stroke="var(--ink, #111)" stroke-width="1.5" class="anim-ring-reverse" stroke-dasharray="40 10 10 10" />
          
          <!-- Inner solid shape shifting -->
          <rect x="75" y="75" width="50" height="50" fill="none" stroke="url(#grad)" stroke-width="2" class="anim-box" />
          
          <!-- Center dot -->
          <circle cx="100" cy="100" r="3" fill="var(--accent, #1e3a8a)" class="anim-pulse" />
        </g>
      </svg>
      
      <!-- Ghost Text behind SVG -->
      <div class="status-ghost" aria-hidden="true">
        {status}
      </div>
    </div>
    
    <!-- Error Copy -->
    <div class="text-container">
      <span class="eyebrow">Error {status}</span>
      <h1 class="title">{title}</h1>
      <p class="description">{description}</p>
      
      <a href="/" class="btn-home">
        <ArrowLeft size={16} strokeWidth={2} />
        Return to Home
      </a>
    </div>
    
  </div>
</div>

<style>
  .error-layout {
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: var(--surface, #fff);
    padding: clamp(24px, 5vw, 48px);
    overflow: hidden;
  }

  .error-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 600px;
    width: 100%;
    gap: clamp(40px, 8vw, 64px);
    position: relative;
    z-index: 10;
  }

  /* SVG Art Styles */
  .art-container {
    position: relative;
    width: 100%;
    max-width: 320px;
    aspect-ratio: 1 / 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .abstract-art {
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 2;
  }

  .status-ghost {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: var(--font-mono);
    font-size: clamp(8rem, 20vw, 12rem);
    font-weight: 700;
    color: var(--ink, #111);
    opacity: 0.03;
    pointer-events: none;
    user-select: none;
    letter-spacing: -0.05em;
    z-index: 1;
  }

  /* Animations */
  .center-group {
    transform-origin: 100px 100px;
    animation: float 8s ease-in-out infinite;
  }

  .anim-grid {
    animation: pan-grid 20s linear infinite;
  }

  .anim-ring-slow {
    transform-origin: 100px 100px;
    animation: spin 30s linear infinite;
  }

  .anim-ring-reverse {
    transform-origin: 100px 100px;
    animation: spin-reverse 15s linear infinite;
  }

  .anim-box {
    transform-origin: 100px 100px;
    animation: morph-spin 12s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }

  .anim-pulse {
    animation: pulse 2s ease-in-out infinite alternate;
  }

  @keyframes spin {
    100% { transform: rotate(360deg); }
  }

  @keyframes spin-reverse {
    100% { transform: rotate(-360deg); }
  }

  @keyframes morph-spin {
    0% { transform: rotate(0deg) scale(1); border-radius: 0; }
    25% { transform: rotate(90deg) scale(0.8); rx: 25px; }
    50% { transform: rotate(180deg) scale(1.2); rx: 0; }
    75% { transform: rotate(270deg) scale(0.9); rx: 25px; }
    100% { transform: rotate(360deg) scale(1); rx: 0; }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes pan-grid {
    100% { transform: translate(-20px, -20px); }
  }

  @keyframes pulse {
    0% { transform: scale(0.8); opacity: 0.5; }
    100% { transform: scale(1.5); opacity: 1; }
  }

  /* Typography & Content */
  .text-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .eyebrow {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent, #1e3a8a);
    background: rgba(30, 58, 138, 0.05);
    padding: 6px 12px;
    border-radius: 20px;
  }

  .title {
    font-family: var(--font-display);
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 500;
    line-height: 1.1;
    color: var(--ink, #111);
    letter-spacing: -0.02em;
    margin: 0;
  }

  .description {
    font-size: 1.1rem;
    line-height: 1.6;
    color: var(--ink-soft, #2a2a2a);
    max-width: 460px;
    margin: 0 0 16px 0;
  }

  .btn-home {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    height: 52px;
    padding: 0 28px;
    background: var(--ink, #111);
    color: var(--paper, #fff);
    text-decoration: none;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    transition: all 200ms ease;
  }

  .btn-home:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(17, 17, 17, 0.15);
    background: #000;
  }
</style>