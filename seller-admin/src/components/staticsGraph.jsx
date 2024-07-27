import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  Filler
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  Filler
);

const StaticsGraph = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "April", "May", "June"],
    datasets: [
      {
        label: "Sales Price",
        data: [200000, 100000, 50000, 200000, 250000, 300000],
        fill: true,
        backgroundColor: "rgba(237, 161, 201, 0.6)",
        borderColor: "#E00079",
        pointBackgroundColor: "red",
        tension: 0.4,
      },
    ],
  };
  const options = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 100000,
          callback: function (value) {
            return value / 1000 + 'k';
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };
  return <Line className="w-[100%]" data={data} options={options} />;
};

export default StaticsGraph;
