import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Pencil,
  Plus,
  Target,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";

import api from "../services/api";
import Sidebar from "../components/Sidebar";

import {
  buttonStyles,
  cardStyles,
  inputStyles,
  layoutStyles,
  textStyles,
  theme,
} from "../styles/theme";

type Budget = {
  _id: string;
  category: string;
  limit: number;
  month: number;
  year: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: "safe" | "warning" | "exceeded";
};

type BudgetsProps = {
  onLogout: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function Budgets({
  onLogout,
  activePage,
  setActivePage,
}: BudgetsProps) {
  const currentDate = new Date();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");

  const [month, setMonth] = useState(
    currentDate.getMonth() + 1
  );

  const [year, setYear] = useState(
    currentDate.getFullYear()
  );

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [message, setMessage] = useState("");

  const fetchBudgets = async () => {
    try {
      const response = await api.get(
        `/budgets?month=${month}&year=${year}`
      );

      setBudgets(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Could not load budgets");
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [month, year]);

  const resetForm = () => {
    setEditingId(null);
    setCategory("");
    setLimit("");
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const budgetData = {
      category,
      limit: Number(limit),
      month,
      year,
    };

    try {
      if (editingId) {
        await api.put(
          `/budgets/${editingId}`,
          budgetData
        );

        setMessage("Budget updated successfully!");
      } else {
        await api.post("/budgets", budgetData);
        setMessage("Budget created successfully!");
      }

      resetForm();
      await fetchBudgets();
    } catch (error: any) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          (editingId
            ? "Could not update budget"
            : "Could not create budget")
      );
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingId(budget._id);
    setCategory(budget.category);
    setLimit(budget.limit.toString());
    setMessage("Editing budget...");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCancelEdit = () => {
    resetForm();
    setMessage("Edit cancelled");
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/budgets/${id}`);

      if (editingId === id) {
        resetForm();
      }

      setMessage("Budget deleted successfully!");
      await fetchBudgets();
    } catch (error) {
      console.error(error);
      setMessage("Could not delete budget");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onLogout();
  };

  const summary = useMemo(() => {
    const totalBudget = budgets.reduce(
      (total, budget) => total + budget.limit,
      0
    );

    const totalSpent = budgets.reduce(
      (total, budget) => total + budget.spent,
      0
    );

    return {
      totalBudget,
      totalSpent,
      remaining: totalBudget - totalSpent,
    };
  }, [budgets]);

  return (
    <div style={layoutStyles.page}>
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main style={layoutStyles.main}>
        <header style={layoutStyles.pageHeader}>
          <div>
            <p style={eyebrowStyle}>
              SPENDING CONTROL
            </p>

            <h1 style={layoutStyles.pageTitle}>
              Budgets
            </h1>

            <p style={layoutStyles.pageSubtitle}>
              Set monthly limits and stay ahead of your spending.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={buttonStyles.danger}
          >
            Logout
          </button>
        </header>

        <section style={periodCardStyle}>
          <div style={periodHeadingStyle}>
            <div style={periodIconStyle}>
              <CalendarDays size={20} />
            </div>

            <div>
              <h2 style={textStyles.sectionTitle}>
                Budget Period
              </h2>

              <p style={descriptionStyle}>
                Viewing budgets for {monthNames[month - 1]}{" "}
                {year}
              </p>
            </div>
          </div>

          <div style={periodControlsStyle}>
            <select
              value={month}
              onChange={(e) => {
                setMonth(Number(e.target.value));
                resetForm();
              }}
              style={compactSelectStyle}
            >
              {monthNames.map((name, index) => (
                <option
                  key={name}
                  value={index + 1}
                >
                  {name}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={year}
              min="2000"
              max="2100"
              onChange={(e) => {
                setYear(Number(e.target.value));
                resetForm();
              }}
              style={yearInputStyle}
            />
          </div>
        </section>

        <section style={summaryGridStyle}>
          <SummaryCard
            title="Total Budget"
            value={summary.totalBudget}
            subtitle={`${budgets.length} active categor${
              budgets.length === 1 ? "y" : "ies"
            }`}
            icon={<Target size={20} />}
            color={theme.colors.primary}
            background={theme.colors.primarySoft}
          />

          <SummaryCard
            title="Total Spent"
            value={summary.totalSpent}
            subtitle="Across all categories"
            icon={<WalletCards size={20} />}
            color={theme.colors.warning}
            background={theme.colors.warningSoft}
          />

          <SummaryCard
            title={
              summary.remaining >= 0
                ? "Remaining"
                : "Over Budget"
            }
            value={Math.abs(summary.remaining)}
            subtitle={
              summary.remaining >= 0
                ? "Available to spend"
                : "Above your total limit"
            }
            icon={<CircleDollarSign size={20} />}
            color={
              summary.remaining >= 0
                ? theme.colors.success
                : theme.colors.danger
            }
            background={
              summary.remaining >= 0
                ? theme.colors.successSoft
                : theme.colors.dangerSoft
            }
          />
        </section>

        <section style={contentGridStyle}>
          <div style={cardStyles.paddedCard}>
            <div style={formHeaderStyle}>
              <div>
                <p style={sectionEyebrowStyle}>
                  {editingId ? "UPDATE" : "NEW LIMIT"}
                </p>

                <h2 style={textStyles.sectionTitle}>
                  {editingId
                    ? "Edit Budget"
                    : "Create Budget"}
                </h2>

                <p style={descriptionStyle}>
                  {editingId
                    ? "Update this monthly spending limit."
                    : `Set a limit for ${monthNames[month - 1]}.`}
                </p>
              </div>

              <div style={formIconStyle}>
                {editingId ? (
                  <Pencil size={19} />
                ) : (
                  <Plus size={20} />
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <label style={textStyles.label}>
                Category
              </label>

              <input
                type="text"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                placeholder="Food, Shopping, Travel..."
                required
                style={inputStyles.input}
              />

              <label style={textStyles.label}>
                Monthly Limit
              </label>

              <div style={amountWrapperStyle}>
                <span style={currencyStyle}>₹</span>

                <input
                  type="number"
                  min="1"
                  value={limit}
                  onChange={(e) =>
                    setLimit(e.target.value)
                  }
                  placeholder="5000"
                  required
                  style={amountInputStyle}
                />
              </div>

              <button
                type="submit"
                style={{
                  ...buttonStyles.primary,
                  width: "100%",
                }}
              >
                {editingId
                  ? "Update Budget"
                  : "Create Budget"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{
                    ...buttonStyles.secondary,
                    width: "100%",
                    marginTop: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "7px",
                  }}
                >
                  <X size={16} />
                  Cancel Edit
                </button>
              )}
            </form>

            {message && (
              <div style={messageStyle}>
                {message}
              </div>
            )}
          </div>

          <div style={cardStyles.paddedCard}>
            <div style={budgetListHeaderStyle}>
              <div>
                <p style={sectionEyebrowStyle}>
                  MONTHLY PLAN
                </p>

                <h2 style={textStyles.sectionTitle}>
                  Category Budgets
                </h2>

                <p style={descriptionStyle}>
                  {budgets.length} budget
                  {budgets.length === 1 ? "" : "s"} for{" "}
                  {monthNames[month - 1]}
                </p>
              </div>
            </div>

            {budgets.length === 0 ? (
              <div style={emptyStateStyle}>
                <div style={emptyIconStyle}>
                  <Target size={25} />
                </div>

                <h3 style={emptyTitleStyle}>
                  No budgets yet
                </h3>

                <p style={emptyTextStyle}>
                  Create your first spending limit for this month.
                </p>
              </div>
            ) : (
              <div>
                {budgets.map((budget, index) => (
                  <BudgetRow
                    key={budget._id}
                    budget={budget}
                    isLast={index === budgets.length - 1}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  color,
  background,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  background: string;
}) {
  return (
    <div style={summaryCardStyle}>
      <div
        style={{
          ...summaryIconStyle,
          color,
          background,
        }}
      >
        {icon}
      </div>

      <p style={summaryTitleStyle}>{title}</p>

      <h2 style={summaryValueStyle}>
        ₹{value.toLocaleString("en-IN")}
      </h2>

      <p style={summarySubtitleStyle}>
        {subtitle}
      </p>
    </div>
  );
}

function BudgetRow({
  budget,
  isLast,
  onEdit,
  onDelete,
}: {
  budget: Budget;
  isLast: boolean;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}) {
  const displayPercentage = Math.min(
    Math.max(budget.percentage, 0),
    100
  );

  const statusConfig = {
    safe: {
      label: "Safe",
      color: theme.colors.success,
      background: theme.colors.successSoft,
      icon: <CheckCircle2 size={14} />,
    },
    warning: {
      label: "Warning",
      color: theme.colors.warning,
      background: theme.colors.warningSoft,
      icon: <AlertTriangle size={14} />,
    },
    exceeded: {
      label: "Exceeded",
      color: theme.colors.danger,
      background: theme.colors.dangerSoft,
      icon: <AlertTriangle size={14} />,
    },
  };

  const status = statusConfig[budget.status];

  return (
    <div
      style={{
        ...budgetRowStyle,
        borderBottom: isLast
          ? "none"
          : `1px solid ${theme.colors.borderLight}`,
      }}
    >
      <div style={budgetTopRowStyle}>
        <div>
          <div style={budgetTitleRowStyle}>
            <h3 style={budgetTitleStyle}>
              {budget.category}
            </h3>

            <span
              style={{
                ...statusBadgeStyle,
                color: status.color,
                background: status.background,
              }}
            >
              {status.icon}
              {status.label}
            </span>
          </div>

          <p style={budgetMetaStyle}>
            ₹{budget.spent.toLocaleString("en-IN")} spent of{" "}
            ₹{budget.limit.toLocaleString("en-IN")}
          </p>
        </div>

        <div style={actionsStyle}>
          <button
            type="button"
            onClick={() => onEdit(budget)}
            title="Edit budget"
            style={editButtonStyle}
          >
            <Pencil size={16} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(budget._id)}
            title="Delete budget"
            style={deleteButtonStyle}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div style={progressHeaderStyle}>
        <span style={progressLabelStyle}>
          Spending progress
        </span>

        <strong
          style={{
            ...percentageStyle,
            color: status.color,
          }}
        >
          {budget.percentage.toFixed(0)}%
        </strong>
      </div>

      <div style={progressTrackStyle}>
        <div
          style={{
            width: `${displayPercentage}%`,
            height: "100%",
            borderRadius: theme.radius.pill,
            background: status.color,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      <div style={budgetFooterStyle}>
        <span style={remainingLabelStyle}>
          {budget.remaining >= 0
            ? "Remaining"
            : "Over budget"}
        </span>

        <strong
          style={{
            color:
              budget.remaining >= 0
                ? theme.colors.text
                : theme.colors.danger,
          }}
        >
          ₹
          {Math.abs(budget.remaining).toLocaleString(
            "en-IN"
          )}
        </strong>
      </div>

      {budget.status !== "safe" && (
        <div
          style={{
            ...alertStyle,
            color: status.color,
            background: status.background,
          }}
        >
          <AlertTriangle size={15} />

          <span>
            {budget.status === "warning"
              ? "You have used over 80% of this budget."
              : "This budget limit has been exceeded."}
          </span>
        </div>
      )}
    </div>
  );
}

const eyebrowStyle = {
  margin: "0 0 8px",
  color: theme.colors.primary,
  fontSize: "10px",
  fontWeight: 800,
  letterSpacing: "1.5px",
};

const descriptionStyle = {
  margin: "7px 0 0",
  color: theme.colors.textMuted,
  fontSize: "12px",
};

const sectionEyebrowStyle = {
  margin: "0 0 7px",
  color: theme.colors.primary,
  fontSize: "9px",
  fontWeight: 800,
  letterSpacing: "1.3px",
};

const periodCardStyle = {
  ...cardStyles.paddedCard,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "20px",
  marginBottom: "18px",
  flexWrap: "wrap" as const,
};

const periodHeadingStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const periodIconStyle = {
  width: "42px",
  height: "42px",
  flexShrink: 0,
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: theme.colors.primarySoft,
  color: theme.colors.primary,
};

const periodControlsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap" as const,
  flex: 1,
  justifyContent: "flex-end",
};

const compactSelectStyle = {
  padding: "10px 35px 10px 12px",
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.medium,
  background: theme.colors.surface,
  color: theme.colors.text,
  outline: "none",
  cursor: "pointer",
};

const yearInputStyle = {
  width: "100px",
  padding: "10px 12px",
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.medium,
  background: theme.colors.surface,
  color: theme.colors.text,
  outline: "none",
  boxSizing: "border-box" as const,
};
const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "18px",
  marginBottom: "24px",
};
const summaryCardStyle = {
  ...cardStyles.paddedCard,
};

const summaryIconStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "18px",
};

const summaryTitleStyle = {
  margin: 0,
  color: theme.colors.textSecondary,
  fontSize: "13px",
  fontWeight: 600,
};

const summaryValueStyle = {
  margin: "8px 0",
  color: theme.colors.text,
  fontSize: "25px",
  letterSpacing: "-0.6px",
};

const summarySubtitleStyle = {
  margin: 0,
  color: theme.colors.textMuted,
  fontSize: "11px",
};

const contentGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "24px",
  alignItems: "start",
};

const formHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  marginBottom: "20px",
};

const formIconStyle = {
  width: "40px",
  height: "40px",
  flexShrink: 0,
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: theme.colors.primarySoft,
  color: theme.colors.primary,
};

const amountWrapperStyle = {
  position: "relative" as const,
  marginTop: "6px",
  marginBottom: "16px",
};

const currencyStyle = {
  position: "absolute" as const,
  left: "14px",
  top: "50%",
  transform: "translateY(-50%)",
  color: theme.colors.textSecondary,
  fontSize: "18px",
  fontWeight: 700,
};

const amountInputStyle = {
  width: "100%",
  padding: "13px 14px 13px 35px",
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.medium,
  background: theme.colors.surface,
  color: theme.colors.text,
  fontSize: "20px",
  fontWeight: 700,
  outline: "none",
  boxSizing: "border-box" as const,
};

const messageStyle = {
  marginTop: "14px",
  padding: "10px 12px",
  borderRadius: theme.radius.small,
  background: theme.colors.infoSoft,
  color: theme.colors.info,
  fontSize: "12px",
  fontWeight: 600,
};

const budgetListHeaderStyle = {
  marginBottom: "8px",
};

const budgetRowStyle = {
  padding: "20px 0",
};

const budgetTopRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
};

const budgetTitleRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  flexWrap: "wrap" as const,
};

const budgetTitleStyle = {
  margin: 0,
  color: theme.colors.text,
  fontSize: "15px",
};

const statusBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  padding: "4px 8px",
  borderRadius: theme.radius.pill,
  fontSize: "10px",
  fontWeight: 700,
};

const budgetMetaStyle = {
  margin: "6px 0 0",
  color: theme.colors.textSecondary,
  fontSize: "12px",
};

const actionsStyle = {
  display: "flex",
  gap: "7px",
};

const editButtonStyle = {
  width: "34px",
  height: "34px",
  border: "none",
  borderRadius: "9px",
  background: theme.colors.primarySoft,
  color: theme.colors.primary,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const deleteButtonStyle = {
  ...editButtonStyle,
  background: theme.colors.dangerSoft,
  color: theme.colors.danger,
};

const progressHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "18px",
  marginBottom: "8px",
};

const progressLabelStyle = {
  color: theme.colors.textMuted,
  fontSize: "11px",
};

const percentageStyle = {
  fontSize: "12px",
};

const progressTrackStyle = {
  width: "100%",
  height: "9px",
  background: theme.colors.borderLight,
  borderRadius: theme.radius.pill,
  overflow: "hidden",
};

const budgetFooterStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "10px",
  fontSize: "12px",
};

const remainingLabelStyle = {
  color: theme.colors.textMuted,
};

const alertStyle = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  marginTop: "14px",
  padding: "9px 11px",
  borderRadius: theme.radius.small,
  fontSize: "11px",
  fontWeight: 650,
};

const emptyStateStyle = {
  padding: "60px 20px",
  textAlign: "center" as const,
};

const emptyIconStyle = {
  width: "52px",
  height: "52px",
  margin: "0 auto 14px",
  borderRadius: "15px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: theme.colors.primarySoft,
  color: theme.colors.primary,
};

const emptyTitleStyle = {
  margin: "0 0 7px",
  color: theme.colors.text,
};

const emptyTextStyle = {
  margin: 0,
  color: theme.colors.textMuted,
  fontSize: "13px",
};

export default Budgets;