<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { parseLogfile } from "$lib/cgr30Parse";
  import { error } from "@sveltejs/kit";
  import { Chart } from "chart.js/auto";
  import type { PageProps } from "./$types";

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

  // Update the chart in an effect, so we can get the canvas context
  $effect(() => {
    const ctx = document.getElementById("logchart") as HTMLCanvasElement;
    if (!ctx || !parsedLogfile || !parsedLogfile?.datasets?.length) return;

    new Chart(ctx, {
      type: "line",
      options: {
        normalized: true,
        parsing: false,
        animation: false,
        plugins: {
          decimation: {
            enabled: true,
            // algorithm: "lttb",
          },
        },
        scales: {
          x: {
            type: "linear",
            // ticks: {
            //   source: "auto",
            //   // Disabled rotation for performance
            //   maxRotation: 0,
            //   autoSkip: true,
            // },
          },
          y: {
            beginAtZero: true,
          },
        },
      },

      data: {
        datasets: parsedLogfile.datasets.slice(2, 5),
      },
    });
  });
</script>

<div>
  <canvas id="logchart"></canvas>
</div>
