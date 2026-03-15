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

<section class="chart-card" id={`section-${chartId}`}>
  <div class="chart-header">
    <h3>{LogGroupInfo[logGroup.group].title}</h3>
    <span class="chart-meta">{logGroup.datasets.length} series</span>
  </div>
  <canvas class="chart-canvas" id={chartId}></canvas>
</section>

<style>
  .chart-card {
    background: var(--panel);
    border: 1px solid var(--panel-border);
    border-radius: 16px;
    padding: 16px 18px 20px;
    box-shadow: var(--shadow);
  }

  .chart-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 8px;
  }

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .chart-meta {
    font-size: 12px;
    color: var(--muted);
  }

  .chart-canvas {
    width: 100%;
    height: 280px;
  }

  @media (max-width: 720px) {
    .chart-canvas {
      height: 220px;
    }
  }
</style>
