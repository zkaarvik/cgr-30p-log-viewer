<script lang="ts">
  import { goto } from "$app/navigation";
  import { error } from "@sveltejs/kit";
  import { Chart } from "chart.js/auto";
  import zoomPlugin from "chartjs-plugin-zoom";
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
  Chart.register(zoomPlugin);

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
        datasets: {
          line: {
            pointStyle: false,
          },
        },
        elements: {
          line: {
            tension: 0.1,
          },
        },
        plugins: {
          decimation: {
            enabled: true,
          },
          zoom: {
            pan: {
              enabled: true,
              mode: "x",
            },
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true,
              },
              drag: {
                enabled: true,
                modifierKey: "shift",
              },
              mode: "x",
            },
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
