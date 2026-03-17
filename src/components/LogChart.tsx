import { useEffect, useMemo, useRef } from "react";
import { Chart } from "$lib/chartSetup";
import { KnownLogTypes, LogGroupInfo, type LogGroup } from "$lib/types";
import "./LogChart.css";

interface LogChartProps {
  logGroup: LogGroup;
  xLimits: { min: number; max: number };
}

const LogChart = ({ logGroup, xLimits }: LogChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  const prettyLabelDatasets = useMemo(
    () =>
      logGroup.datasets.map((dataset) => ({
        label: KnownLogTypes[dataset.label]?.prettyLabel ?? dataset.label,
        data: dataset.data,
      })),
    [logGroup.datasets]
  );

  useEffect(() => {
    const ctx = canvasRef.current;
    if (!ctx || !logGroup || !logGroup.datasets?.length) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    chartRef.current = new Chart(ctx, {
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

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [logGroup, prettyLabelDatasets, xLimits]);

  return (
    <section
      className="chart-card"
      id={`section-${logGroup.group}`}
      data-group={logGroup.group}
    >
      <div className="chart-header">
        <h3>{LogGroupInfo[logGroup.group].title}</h3>
        <span className="chart-meta">{logGroup.datasets.length} series</span>
      </div>
      <canvas className="chart-canvas" ref={canvasRef}></canvas>
    </section>
  );
};

export default LogChart;
