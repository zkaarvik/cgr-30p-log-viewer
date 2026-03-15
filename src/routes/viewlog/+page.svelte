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

<style>
  .details {
    background: var(--panel);
    border: 1px solid var(--panel-border);
    border-radius: 14px;
    padding: 12px 16px;
    box-shadow: var(--shadow);
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
</style>
