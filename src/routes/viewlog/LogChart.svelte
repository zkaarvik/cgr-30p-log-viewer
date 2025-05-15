<script lang="ts">
  import { KnownLogTypes, LogGroupInfo, type LogGroup } from "$lib/types";
  import { Chart } from "chart.js";

  interface Props {
    logGroup: LogGroup;
    xLimits: { min: number; max: number };
  }

  let { logGroup, xLimits }: Props = $props();
  const chartId = logGroup.group;
  const prettyLabelDatasets = logGroup.datasets.map((dataset) => ({
    label: KnownLogTypes[dataset.label]?.prettyLabel ?? dataset.label,
    data: dataset.data,
  }));

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
              x: xLimits,
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
            suggestedMin: LogGroupInfo[logGroup.group].limits.y.min,
            suggestedMax: LogGroupInfo[logGroup.group].limits.y.max,
          },
        },
      },
      data: {
        datasets: prettyLabelDatasets,
      },
    });
  });
</script>

<div>
  <h3>{LogGroupInfo[logGroup.group].title}</h3>
  <canvas id={chartId}></canvas>
</div>
