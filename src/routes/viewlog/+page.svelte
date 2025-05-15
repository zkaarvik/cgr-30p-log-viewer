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

<details>
  <summary style:width="100%">File Details</summary>
  <table>
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

<small>Scroll/pinch to zoom, or shift+drag to select timespan</small>

{#each sortedLogGroups as sortedLogGroup}
  <LogChart
    logGroup={sortedLogGroup}
    xLimits={parsedLogfile.calculated.limits.x}
  />
{/each}
