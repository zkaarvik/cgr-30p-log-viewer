<script lang="ts">
  import { goto } from "$app/navigation";
  import { error } from "@sveltejs/kit";
  import { Chart } from "chart.js/auto";
  import zoomPlugin from "chartjs-plugin-zoom";
  import "chartjs-adapter-spacetime";
  import type { PageProps } from "./$types";
  import LogChart from "./LogChart.svelte";
  import { sortLogGroups } from "$lib/cgr30Parse";
  import { base } from "$app/paths";
  import { LogGroupInfo } from "$lib/types";

  const { data }: PageProps = $props();
  const parsedLogfile = data.parsedLogfile;

  if (!parsedLogfile) {
    // For now just go back to home
    goto(`${base}/`);
    error(404, "No file provided");
  }

  // LATER: Prepare chart lib and with only used
  // remove /auto from import and set it up here
  // Chart.register(BarController, BarElement, LineController, LineElement, PointElement, LinearScale, Tooltip);
  Chart.register(zoomPlugin);

  const sortedLogGroups = sortLogGroups(parsedLogfile);
</script>

<div class="viewlog-layout">
  <aside class="nav-column">
    <div class="nav-title">Charts</div>
    <nav class="nav-list">
      {#each sortedLogGroups as sortedLogGroup}
        <a href={`#section-${sortedLogGroup.group}`}>
          {LogGroupInfo[sortedLogGroup.group].title}
        </a>
      {/each}
    </nav>
  </aside>

  <main class="content-column">
    <section class="aircraft-card">
      <div class="aircraft-block">
        <div class="aircraft-label">Aircraft ID</div>
        <div class="aircraft-id">
          {parsedLogfile.preamble["Aircraft ID"] ?? "Unknown"}
        </div>
      </div>
      <div class="aircraft-block">
        <div class="aircraft-label">Flight Date</div>
        <div class="aircraft-id">
          {parsedLogfile.preamble["Local Time"] ?? "Unknown"}
        </div>
      </div>
    </section>

    <details class="details">
      <summary>File Details</summary>
      <table class="details-table">
        <tbody>
          {#each Object.entries(parsedLogfile.preamble) as [name, value]}
            <tr>
              <td>{name}</td>
              <td>{value}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </details>

    <p class="hint">Scroll or pinch to zoom. Shift + drag to select a timespan.</p>

    {#each sortedLogGroups as sortedLogGroup}
      <LogChart
        logGroup={sortedLogGroup}
        xLimits={parsedLogfile.calculated.limits.x}
      />
    {/each}
  </main>
</div>

<style>
  .details {
    background: var(--panel);
    border: 1px solid var(--panel-border);
    border-radius: 14px;
    padding: 12px 16px;
    box-shadow: var(--shadow);
  }

  .aircraft-card {
    background: linear-gradient(135deg, rgba(16, 24, 38, 0.08), transparent);
    border: 1px solid var(--panel-border);
    border-radius: 18px;
    padding: 18px 20px;
    box-shadow: var(--shadow);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    align-items: start;
  }

  .aircraft-block {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .aircraft-label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--muted);
  }

  .aircraft-id {
    margin-top: 6px;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: var(--text);
  }

  summary {
    cursor: pointer;
    font-weight: 500;
  }

  .details-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    font-size: 13px;
  }

  .details-table td {
    padding: 6px 0;
    border-bottom: 1px solid rgba(16, 24, 38, 0.06);
  }

  .details-table td:first-child {
    color: var(--muted);
    width: 40%;
  }

  .hint {
    margin: 0;
    font-size: 13px;
    color: var(--muted);
  }

  .viewlog-layout {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    gap: 24px;
    align-items: start;
  }

  .nav-column {
    position: sticky;
    top: 18px;
    align-self: start;
    background: var(--panel);
    border: 1px solid var(--panel-border);
    border-radius: 16px;
    padding: 16px;
    box-shadow: var(--shadow);
  }

  .nav-title {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
    margin-bottom: 12px;
  }

  .nav-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .nav-list a {
    color: var(--text);
    text-decoration: none;
    font-size: 14px;
    line-height: 1.3;
    padding: 6px 8px;
    border-radius: 10px;
    background: rgba(16, 24, 38, 0.04);
    border: 1px solid transparent;
    transition: border-color 120ms ease, background 120ms ease,
      transform 120ms ease;
  }

  .nav-list a:hover {
    border-color: var(--panel-border);
    background: rgba(16, 24, 38, 0.08);
    transform: translateX(2px);
  }

  .content-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }

  @media (max-width: 960px) {
    .viewlog-layout {
      grid-template-columns: 1fr;
    }

    .nav-column {
      position: static;
      top: auto;
    }
  }
</style>
