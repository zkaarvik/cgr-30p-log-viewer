import { Chart } from "chart.js/auto";
import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-luxon";

Chart.register(zoomPlugin);
Chart.defaults.adapters ??= {};
Chart.defaults.adapters.date = {
  zone: "local",
};

export { Chart };
