<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { parseLogfile } from "$lib/cgr30Parse";
  import { error } from "@sveltejs/kit";
  import { Chart } from "chart.js/auto";

  const csvFile = $state(page.state.logfile);
  const fileName = page.url.searchParams.get("logname");

  let parsedLogfile = $state<ParsedLogfile | null>(null);

  if (!csvFile /*&& !fileName*/) {
    // For now just go back to home
    goto("/");
    error(404, "No file provided");
  }

  // LATER: Prepare chart lib and with only used
  // remove /auto from import and set it up here
  // Chart.register(BarController, BarElement, LineController, LineElement, PointElement, LinearScale, Tooltip);
  parseLogfile(csvFile).then((parsedFile) => (parsedLogfile = parsedFile));

  // Update the chart in an effect, so we can get the canvas context
  $effect(() => {
    const ctx = document.getElementById("logchart") as HTMLCanvasElement;
    if (!ctx || !parsedLogfile || !parsedLogfile?.datasets?.length) return;

    new Chart(ctx, {
      type: "line",
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
      data: {
        labels: parsedLogfile.datasets[0].data, // First row is 'TIME'
        datasets: parsedLogfile.datasets.slice(1, 4),
      },
    });
  });
</script>

<div>
  <canvas id="logchart"></canvas>
</div>
