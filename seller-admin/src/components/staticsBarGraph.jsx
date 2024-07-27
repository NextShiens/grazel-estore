import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  Filler
} from "chart.js";

ChartJS.register(
  BarElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  Filler
);

const StaticsBarGraph = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "April", "May", "June"],
    datasets: [
      {
        label: "Sales Price",
        data: [200000, 100000, 50000, 200000, 250000, 300000],
        backgroundColor: "#00A1FF",
        borderColor: "transparent",
        borderWidth: 1,
        borderRadius: 10
      },
    ],
  };

  const options = {
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
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

  return <Bar className="w-[100%]" data={data} options={options} />;
};

export default StaticsBarGraph;
