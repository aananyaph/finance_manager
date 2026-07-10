import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Doughnut } from "react-chartjs-2";
import { theme } from "../styles/theme";

ChartJS.register(ArcElement, Tooltip, Legend);

type FinanceChartProps = {
  income: number;
  expense: number;
};

function FinanceChart({
  income,
  expense,
}: FinanceChartProps) {
  const total = income + expense;

  const savingsRate =
    income > 0
      ? ((income - expense) / income) * 100
      : 0;

  const data = {
    labels: ["Income", "Expenses"],
    datasets: [
      {
        data:
          total > 0
            ? [income, expense]
            : [1],
        backgroundColor:
          total > 0
            ? [
                theme.colors.success,
                theme.colors.danger,
              ]
            : [theme.colors.border],
        borderWidth: 0,
        spacing: 4,
        borderRadius: 8,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    cutout: "72%",

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        callbacks: {
          label: (context: any) => {
            if (total === 0) {
              return "No financial data";
            }

            const value = Number(context.raw);

            return `${context.label}: ₹${value.toLocaleString(
              "en-IN"
            )}`;
          },
        },
      },
    },
  };

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={titleStyle}>
            Income vs Expenses
          </h2>

          <p style={subtitleStyle}>
            Overall financial distribution
          </p>
        </div>

        <span style={periodBadgeStyle}>
          All time
        </span>
      </div>

      <div style={contentStyle}>
        <div style={chartWrapperStyle}>
          <Doughnut
            data={data}
            options={options}
          />

          <div style={centerContentStyle}>
            <span style={centerLabelStyle}>
              Savings
            </span>

            <strong
              style={{
                ...centerValueStyle,
                color:
                  savingsRate >= 0
                    ? theme.colors.success
                    : theme.colors.danger,
              }}
            >
              {savingsRate.toFixed(0)}%
            </strong>
          </div>
        </div>

        <div style={detailsStyle}>
          <FinanceRow
            label="Total Income"
            value={income}
            color={theme.colors.success}
          />

          <FinanceRow
            label="Total Expenses"
            value={expense}
            color={theme.colors.danger}
          />

          <div style={dividerStyle} />

          <FinanceRow
            label="Net Balance"
            value={income - expense}
            color={
              income - expense >= 0
                ? theme.colors.primary
                : theme.colors.danger
            }
          />
        </div>
      </div>
    </div>
  );
}

function FinanceRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div style={financeRowStyle}>
      <div style={rowLabelStyle}>
        <span
          style={{
            ...dotStyle,
            background: color,
          }}
        />

        <span>{label}</span>
      </div>

      <strong style={rowValueStyle}>
        ₹{Math.abs(value).toLocaleString("en-IN")}
      </strong>
    </div>
  );
}

const cardStyle = {
  background: theme.colors.surface,
  padding: "24px",
  borderRadius: theme.radius.large,
  border: `1px solid ${theme.colors.borderLight}`,
  boxShadow: theme.shadow.small,
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
};

const titleStyle = {
  margin: 0,
  color: theme.colors.text,
  fontSize: "18px",
  letterSpacing: "-0.3px",
};

const subtitleStyle = {
  margin: "6px 0 0",
  color: theme.colors.textMuted,
  fontSize: "12px",
};

const periodBadgeStyle = {
  padding: "6px 10px",
  borderRadius: theme.radius.pill,
  background: theme.colors.surfaceSoft,
  color: theme.colors.textSecondary,
  fontSize: "11px",
  fontWeight: 650,
};

const contentStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "50px",
  paddingTop: "22px",
  flexWrap: "wrap" as const,
};

const chartWrapperStyle = {
  width: "230px",
  height: "230px",
  position: "relative" as const,
};

const centerContentStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  pointerEvents: "none" as const,
};

const centerLabelStyle = {
  color: theme.colors.textMuted,
  fontSize: "11px",
};

const centerValueStyle = {
  marginTop: "3px",
  fontSize: "24px",
  letterSpacing: "-0.6px",
};

const detailsStyle = {
  width: "100%",
  maxWidth: "310px",
  display: "flex",
  flexDirection: "column" as const,
  gap: "17px",
};

const financeRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
};

const rowLabelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  color: theme.colors.textSecondary,
  fontSize: "13px",
};

const dotStyle = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
};

const rowValueStyle = {
  color: theme.colors.text,
  fontSize: "14px",
};

const dividerStyle = {
  height: "1px",
  background: theme.colors.borderLight,
};

export default FinanceChart;