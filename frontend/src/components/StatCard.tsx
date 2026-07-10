import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
} from "lucide-react";

import { theme } from "../styles/theme";

type StatCardProps = {
  title: string;
  value: number;
  icon: string;
};

function StatCard({
  title,
  value,
  icon,
}: StatCardProps) {
  const isIncome = title === "Total Income";
  const isExpense = title === "Total Expenses";

  const accentColor = isIncome
    ? theme.colors.success
    : isExpense
      ? theme.colors.danger
      : theme.colors.primary;

  const softBackground = isIncome
    ? theme.colors.successSoft
    : isExpense
      ? theme.colors.dangerSoft
      : theme.colors.primarySoft;

  const TrendIcon = isIncome
    ? ArrowUpRight
    : isExpense
      ? ArrowDownRight
      : Wallet;

  return (
    <div style={cardStyle}>
      <div style={topRowStyle}>
        <div
          style={{
            ...iconBoxStyle,
            background: softBackground,
            color: accentColor,
          }}
        >
          <TrendIcon size={21} strokeWidth={2.2} />
        </div>

        <span
          style={{
            ...statusBadgeStyle,
            color: accentColor,
            background: softBackground,
          }}
        >
          {isIncome
            ? "Income"
            : isExpense
              ? "Spent"
              : "Available"}
        </span>
      </div>

      <p style={titleStyle}>{title}</p>

      <h2 style={valueStyle}>
        ₹{Math.abs(value).toLocaleString("en-IN")}
      </h2>

      <div style={bottomRowStyle}>
        <span
          style={{
            ...indicatorStyle,
            background: accentColor,
          }}
        />

        <span style={bottomTextStyle}>
          {title === "Current Balance"
            ? value >= 0
              ? "Positive account balance"
              : "Expenses exceed income"
            : isIncome
              ? "Total money received"
              : "Total money spent"}
        </span>
      </div>
    </div>
  );
}

const cardStyle = {
  flex: 1,
  minWidth: "210px",
  padding: "22px",
  background: theme.colors.surface,
  border: `1px solid ${theme.colors.borderLight}`,
  borderRadius: theme.radius.large,
  boxShadow: theme.shadow.small,
};

const topRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "20px",
};

const iconBoxStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const statusBadgeStyle = {
  padding: "5px 9px",
  borderRadius: theme.radius.pill,
  fontSize: "11px",
  fontWeight: 700,
};

const titleStyle = {
  margin: 0,
  color: theme.colors.textSecondary,
  fontSize: "13px",
  fontWeight: 600,
};

const valueStyle = {
  margin: "8px 0 18px",
  color: theme.colors.text,
  fontSize: "27px",
  lineHeight: 1.1,
  letterSpacing: "-0.7px",
};

const bottomRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const indicatorStyle = {
  width: "7px",
  height: "7px",
  borderRadius: "50%",
};

const bottomTextStyle = {
  color: theme.colors.textMuted,
  fontSize: "11px",
};

export default StatCard;