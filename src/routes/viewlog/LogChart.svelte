<script lang="ts">
  import { Chart } from "chart.js";

  interface Props {
    chartId: string;
    label: string;
    logGroup: LogGroup;
  }

  let { chartId, label, logGroup }: Props = $props();

  // Update the chart in an effect, so we can get the canvas context
  $effect(() => {
    const ctx = document.getElementById(chartId) as HTMLCanvasElement;
    if (!ctx || !logGroup || !logGroup.datasets?.length) return;

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
            borderWidth: 1.5,
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
            limits: {
              x: logGroup.limits?.x,
            },
          },
        },
        scales: {
          x: {
            type: "time",
            ticks: {
              source: "auto",
              // Disabled rotation for performance
              maxRotation: 0,
              autoSkip: true,
              autoSkipPadding: 10,
            },
          },
          y: {
            beginAtZero: true,
            suggestedMin: logGroup.limits?.y?.min,
            suggestedMax: logGroup.limits?.y?.max,
          },
        },
      },
      data: {
        datasets: logGroup.datasets,
      },
    });
  });
</script>

<div>
  <h3>{label}</h3>
  <canvas id={chartId}></canvas>
</div>
