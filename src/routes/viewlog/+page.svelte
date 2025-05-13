<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { Chart } from "chart.js/auto";

  const csvData = $state(page.state.logdata);
  const fileName = page.url.searchParams.get("logname");

  if (!csvData && !fileName) {
    // For now just go back to home
    goto("/");
  }

  // LATER: Prepare chart lib and with only used
  // remove /auto from import and set it up here
  // Chart.register(BarController, BarElement, LineController, LineElement, PointElement, LinearScale, Tooltip);

  // Prepare data from csv
  let datasets: Dataset[];
  const rows = csvData?.split("\n");
  rows?.forEach((row, index) => {
    const parsedRow = row.split(", ");

    if (index === 0) {
      // Dataset labels
      datasets = parsedRow.map((label) => ({ label, data: [] }));
    } else if (!!row) {
      // Dataset data
      parsedRow.forEach((datapoint, i) => datasets[i].data.push(datapoint));
    }
  });

  // Update the chart in an effect, so we can get the canvas context
  $effect(() => {
    const ctx = document.getElementById("logchart") as HTMLCanvasElement;
    if (!ctx || !datasets || !datasets.length) return;

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
        labels: datasets[0].data, // First row is 'TIME'
        datasets: datasets.slice(1),
      },
    });
  });
</script>

<div>
  <canvas id="logchart"></canvas>
</div>
