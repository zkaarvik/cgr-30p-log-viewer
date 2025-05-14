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
      <tr>
        <td>Ident</td>
        <td>{parsedLogfile.ident}</td>
      </tr>
      <tr>
        <td>Unit ID</td>
        <td>{parsedLogfile.unitId}</td>
      </tr>
      <tr>
        <td>EDC Models</td>
        <td>{parsedLogfile.edcModels}</td>
      </tr>
      <tr>
        <td>Software Version</td>
        <td>{parsedLogfile.softwareVersion}</td>
      </tr>
      <tr>
        <td>Tracking Number</td>
        <td>{parsedLogfile.trackingNumber}</td>
      </tr>
      <tr>
        <td>Local Time</td>
        <td>{parsedLogfile.localTime}</td>
      </tr>
      <tr>
        <td>Zulu Time</td>
        <td>{parsedLogfile.zuluTime}</td>
      </tr>
      <tr>
        <td>Flight Number</td>
        <td>{parsedLogfile.flightNumber}</td>
      </tr>
      <tr>
        <td>Engine Hours</td>
        <td>{parsedLogfile.engineHours}</td>
      </tr>
      <tr>
        <td>Tach Time</td>
        <td>{parsedLogfile.tachTime}</td>
      </tr>
      <tr>
        <td>Data Logging Interval</td>
        <td>{parsedLogfile.dataLoggingInterval}</td>
      </tr>
    </tbody>
  </table>
</details>

<small>Scroll/pinch to zoom, or shift+drag to select timespan</small>

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
