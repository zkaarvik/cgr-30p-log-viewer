<script>
  let { children } = $props();
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="app">
  <header class="topbar">
    <div class="brand">
      <span class="brand-dot" aria-hidden="true"></span>
      <div>
        <div class="title">CGR-30P Log Viewer</div>
        <div class="subtitle">Aviation performance logs</div>
      </div>
    </div>
  </header>

  <main class="content">
    {@render children()}
  </main>
</div>

<style>
  :global(:root) {
    color-scheme: light;
    --bg: #f5f7fb;
    --bg-2: #e8eef7;
    --panel: #ffffff;
    --panel-border: #d9e1ee;
    --text: #101826;
    --muted: #5d6b82;
    --accent: #1f6feb;
    --accent-2: #4fd1c5;
    --shadow: 0 12px 30px rgba(16, 24, 38, 0.08);
  }

  :global(body) {
    margin: 0;
    font-family: "Space Grotesk", system-ui, -apple-system, sans-serif;
    color: var(--text);
    background:
      radial-gradient(1200px 600px at 10% -10%, #eef4ff 0%, transparent 60%),
      radial-gradient(900px 500px at 90% 0%, #ecfbf9 0%, transparent 55%),
      repeating-linear-gradient(
        90deg,
        rgba(16, 24, 38, 0.04) 0,
        rgba(16, 24, 38, 0.04) 1px,
        transparent 1px,
        transparent 120px
      ),
      linear-gradient(180deg, var(--bg), var(--bg-2));
    min-height: 100vh;
  }

  :global(*) {
    box-sizing: border-box;
  }

  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .topbar {
    padding: 28px 32px 8px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .brand-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: conic-gradient(from 120deg, var(--accent), var(--accent-2));
    box-shadow: 0 0 0 6px rgba(31, 111, 235, 0.12);
  }

  .title {
    font-size: 22px;
    font-weight: 600;
    letter-spacing: 0.4px;
  }

  .subtitle {
    font-size: 13px;
    color: var(--muted);
    letter-spacing: 0.3px;
  }

  .content {
    flex: 1;
    padding: 12px 32px 48px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  @media (max-width: 720px) {
    .topbar {
      padding: 22px 20px 6px;
    }

    .content {
      padding: 10px 20px 40px;
    }
  }
</style>
