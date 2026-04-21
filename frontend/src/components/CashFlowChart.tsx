import React from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, type Plugin } from "chart.js";
import { Line } from "react-chartjs-2";
import type { BalancePoint } from "../types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Props {
  data: BalancePoint[];
  targetMinimumBuffer: number;
  safeZoneThreshold: number;
}

const zonesPlugin: Plugin<"line"> = {
  id: "zones",
  beforeDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    if (!chartArea) return;
    const { left, right } = chartArea;
    const yScale = scales["y"];
    const y40 = yScale.getPixelForValue(40000);
    const y48 = yScale.getPixelForValue(48000);
    ctx.save();
    ctx.fillStyle = "rgba(255,235,150,0.35)";
    ctx.fillRect(left, y48, right - left, y40 - y48);
    ctx.restore();
    ctx.save();
    ctx.font = "9px Segoe UI, system-ui, sans-serif";
    ctx.fillStyle = "#2CA01C";
    ctx.fillText("SAFE ZONE", left + 4, y48 - 4);
    ctx.fillStyle = "#F4B000";
    ctx.fillText("YELLOW-ZONE WARNING", left + 4, y40 - 4);
    ctx.restore();
  },
};

export const CashFlowChart: React.FC<Props> = ({ data, targetMinimumBuffer }) => {
  const chartData = {
    labels: data.map((d) => d.day),
    datasets: [
      {
        label: "Cash Balance",
        data: data.map((d) => d.balance),
        borderColor: "#2CA01C",
        borderWidth: 2.5,
        pointRadius: 0,
        tension: 0.4,
        fill: false,
      },
      {
        label: "Target Minimum Buffer",
        data: Array(data.length).fill(targetMinimumBuffer),
        borderColor: "#E57373",
        borderWidth: 1.5,
        borderDash: [6, 4],
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  return (
    <Line
      data={chartData}
      plugins={[zonesPlugin]}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: "top", align: "end", labels: { boxWidth: 12, font: { size: 10 } } },
          tooltip: { mode: "index", intersect: false },
        },
        scales: {
          x: {
            title: { display: true, text: "Day", font: { size: 10 } },
            grid: { display: false },
            ticks: { font: { size: 10 } },
          },
          y: {
            min: 38000, max: 54000,
            ticks: { font: { size: 10 }, callback: (v) => `$${(Number(v) / 1000).toFixed(0)},000` },
            grid: { color: "rgba(0,0,0,0.06)" },
          },
        },
      }}
    />
  );
};