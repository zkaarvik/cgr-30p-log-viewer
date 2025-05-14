<script lang="ts">
  import { goto } from "$app/navigation";
  import { error } from "@sveltejs/kit";
  import { Chart } from "chart.js/auto";
  import zoomPlugin from "chartjs-plugin-zoom";
  import "chartjs-adapter-spacetime";
  import type { PageProps } from "./$types";
  import LogChart from "./LogChart.svelte";
  import { sortLogGroups } from "$lib/cgr30Parse";

  const { data }: PageProps = $props();
  const parsedLogfile = data.parsedLogfile;

  if (!parsedLogfile) {
    // For now just go back to home
    goto("/");
    error(404, "No file provided");
  }

  // LATER: Prepare chart lib and with only used
  // remove /auto from import and set it up here
  // Chart.register(BarController, BarElement, LineController, LineElement, PointElement, LinearScale, Tooltip);
  Chart.register(zoomPlugin);

  const sortedLogGroups = sortLogGroups(parsedLogfile);
</script>

<LogChart chartId="rpm" label="RPM" logGroup={sortedLogGroups.rpm} />
<LogChart
  chartId="fuelFlow"
  label="Fuel Flow"
  logGroup={sortedLogGroups.fuelFlow}
/>
<LogChart
  chartId="egt"
  label="Exhaust Gas Temperature (EGT)"
  logGroup={sortedLogGroups.egt}
/>
<LogChart
  chartId="cht"
  label="Cylinder Head Temperature (CHT)"
  logGroup={sortedLogGroups.cht}
/>
<LogChart
  chartId="oilTemp"
  label="Oil Temperature"
  logGroup={sortedLogGroups.oilTemp}
/>
<LogChart
  chartId="oilPressure"
  label="Oil Pressure"
  logGroup={sortedLogGroups.oilPressure}
/>
<LogChart
  chartId="electrical"
  label="Electrical System"
  logGroup={sortedLogGroups.electrical}
/>
<LogChart
  chartId="fuelLevels"
  label="Fuel Levels"
  logGroup={sortedLogGroups.fuelLevels}
/>
