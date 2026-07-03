import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

type FinanceChartProps = {
  income: number;
  expense: number;
};

function FinanceChart({
  income,
  expense,
}: FinanceChartProps) {
  const data = {
    labels: ["Income", "Expenses"],
    datasets: [
      {
        data: [income, expense],
        backgroundColor: ["#16a34a", "#dc2626"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div
      style={{
        background: "white",
        padding: "24px",
        borderRadius: "14px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
      }}
    >
      <h2>Income vs Expenses</h2>

      <div
        style={{
          maxWidth: "300px",
          margin: "20px auto",
        }}
      >
        <Doughnut data={data} />
      </div>
    </div>
  );
}

export default FinanceChart;