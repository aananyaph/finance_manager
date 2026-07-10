import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  PiggyBank,
  ReceiptText,
  Target,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import api from "../services/api";
import Sidebar from "../components/Sidebar";

import {
  buttonStyles,
  cardStyles,
  layoutStyles,
  textStyles,
  theme,
} from "../styles/theme";

type MonthlyData = {
  month: string;
  income: number;
  expense: number;
};

type CategoryData = {
  category: string;
  amount: number;
};

type AnalyticsData = {
  year: number;

  summary: {
    totalIncome: number;
    totalExpense: number;
    savings: number;
    savingsRate: number;
    transactionCount: number;
  };

  monthlyData: MonthlyData[];
  categoryBreakdown: CategoryData[];
  highestExpenseCategory: CategoryData | null;
};

type ReportsProps = {
  onLogout: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
};

const PIE_COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#db2777",
];

function Reports({
  onLogout,
  activePage,
  setActivePage,
}: ReportsProps) {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);

  const [analytics, setAnalytics] =
    useState<AnalyticsData | null>(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get(
        `/api/analytics?year=${year}`
      );

      setAnalytics(response.data);
    } catch (error: any) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Could not load analytics"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [year]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onLogout();
  };

  const financialStatus =
    !analytics
      ? ""
      : analytics.summary.savingsRate >= 20
        ? "Strong Savings"
        : analytics.summary.savingsRate > 0
          ? "Positive Savings"
          : "Needs Attention";

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
              FINANCIAL ANALYTICS
            </p>

            <h1 style={layoutStyles.pageTitle}>
              Reports & Analytics
            </h1>

            <p style={layoutStyles.pageSubtitle}>
              Understand your income, spending, and savings.
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
                Report Period
              </h2>

              <p style={descriptionStyle}>
                Viewing financial analytics for {year}
              </p>
            </div>
          </div>

          <select
            value={year}
            onChange={(e) =>
              setYear(Number(e.target.value))
            }
            style={yearSelectStyle}
          >
            <option value={currentYear}>
              {currentYear}
            </option>

            <option value={currentYear - 1}>
              {currentYear - 1}
            </option>

            <option value={currentYear - 2}>
              {currentYear - 2}
            </option>
          </select>
        </section>

        {message && (
          <div style={errorStyle}>{message}</div>
        )}

        {loading ? (
          <div style={loadingCardStyle}>
            <div style={loadingIconStyle}>
              <BarChart3 size={25} />
            </div>

            <h3 style={loadingTitleStyle}>
              Loading your report
            </h3>

            <p style={loadingTextStyle}>
              Analysing financial activity for {year}...
            </p>
          </div>
        ) : (
          analytics && (
            <>
              <section style={summaryGridStyle}>
                <SummaryCard
                  title="Total Income"
                  value={`₹${analytics.summary.totalIncome.toLocaleString(
                    "en-IN"
                  )}`}
                  subtitle="Money received this year"
                  icon={<ArrowUpRight size={20} />}
                  color={theme.colors.success}
                  background={theme.colors.successSoft}
                />

                <SummaryCard
                  title="Total Expenses"
                  value={`₹${analytics.summary.totalExpense.toLocaleString(
                    "en-IN"
                  )}`}
                  subtitle="Money spent this year"
                  icon={<ArrowDownRight size={20} />}
                  color={theme.colors.danger}
                  background={theme.colors.dangerSoft}
                />

                <SummaryCard
                  title="Total Savings"
                  value={`${
                    analytics.summary.savings >= 0 ? "" : "-"
                  }₹${Math.abs(
                    analytics.summary.savings
                  ).toLocaleString("en-IN")}`}
                  subtitle={
                    analytics.summary.savings >= 0
                      ? "Income remaining after expenses"
                      : "Expenses exceeded income"
                  }
                  icon={<PiggyBank size={20} />}
                  color={
                    analytics.summary.savings >= 0
                      ? theme.colors.success
                      : theme.colors.danger
                  }
                  background={
                    analytics.summary.savings >= 0
                      ? theme.colors.successSoft
                      : theme.colors.dangerSoft
                  }
                />

                <SummaryCard
                  title="Savings Rate"
                  value={`${analytics.summary.savingsRate.toFixed(
                    1
                  )}%`}
                  subtitle={financialStatus}
                  icon={<TrendingUp size={20} />}
                  color={
                    analytics.summary.savingsRate >= 20
                      ? theme.colors.success
                      : analytics.summary.savingsRate > 0
                        ? theme.colors.warning
                        : theme.colors.danger
                  }
                  background={
                    analytics.summary.savingsRate >= 20
                      ? theme.colors.successSoft
                      : analytics.summary.savingsRate > 0
                        ? theme.colors.warningSoft
                        : theme.colors.dangerSoft
                  }
                />

                <SummaryCard
                  title="Transactions"
                  value={analytics.summary.transactionCount.toString()}
                  subtitle="Total recorded activity"
                  icon={<ReceiptText size={20} />}
                  color={theme.colors.primary}
                  background={theme.colors.primarySoft}
                />
              </section>

              <section style={chartsGridStyle}>
                <div style={cardStyles.paddedCard}>
                  <div style={chartHeaderStyle}>
                    <div>
                      <p style={sectionEyebrowStyle}>
                        CASH FLOW
                      </p>

                      <h2 style={textStyles.sectionTitle}>
                        Income vs Expenses
                      </h2>

                      <p style={descriptionStyle}>
                        Monthly financial activity for {year}
                      </p>
                    </div>

                    <div style={chartIconStyle}>
                      <BarChart3 size={20} />
                    </div>
                  </div>

                  <div style={barChartWrapperStyle}>
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <BarChart
                        data={analytics.monthlyData}
                        margin={{
                          top: 20,
                          right: 10,
                          left: 0,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke={theme.colors.borderLight}
                        />

                        <XAxis
                          dataKey="month"
                          tick={{
                            fontSize: 11,
                            fill: theme.colors.textMuted,
                          }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <YAxis
                          tick={{
                            fontSize: 10,
                            fill: theme.colors.textMuted,
                          }}
                          axisLine={false}
                          tickLine={false}
                          width={55}
                        />

                        <Tooltip
                          formatter={(value) =>
                            `₹${Number(
                              value
                            ).toLocaleString("en-IN")}`
                          }
                          contentStyle={{
                            borderRadius: "10px",
                            border: `1px solid ${theme.colors.border}`,
                            boxShadow: theme.shadow.small,
                            fontSize: "12px",
                          }}
                        />

                        <Legend
                          wrapperStyle={{
                            fontSize: "11px",
                            paddingTop: "14px",
                          }}
                        />

                        <Bar
                          dataKey="income"
                          name="Income"
                          fill={theme.colors.success}
                          radius={[6, 6, 0, 0]}
                        />

                        <Bar
                          dataKey="expense"
                          name="Expenses"
                          fill={theme.colors.danger}
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={cardStyles.paddedCard}>
                  <div style={chartHeaderStyle}>
                    <div>
                      <p style={sectionEyebrowStyle}>
                        SPENDING MIX
                      </p>

                      <h2 style={textStyles.sectionTitle}>
                        Expense Categories
                      </h2>

                      <p style={descriptionStyle}>
                        Where your money was spent
                      </p>
                    </div>

                    <div style={chartIconStyle}>
                      <WalletCards size={20} />
                    </div>
                  </div>

                  {analytics.categoryBreakdown.length ===
                  0 ? (
                    <div style={emptyChartStyle}>
                      <div style={emptyIconStyle}>
                        <WalletCards size={24} />
                      </div>

                      <h3 style={emptyTitleStyle}>
                        No expense data
                      </h3>

                      <p style={emptyTextStyle}>
                        Add expenses to see your category breakdown.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div style={pieChartWrapperStyle}>
                        <ResponsiveContainer
                          width="100%"
                          height="100%"
                        >
                          <PieChart>
                            <Pie
                              data={
                                analytics.categoryBreakdown
                              }
                              dataKey="amount"
                              nameKey="category"
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={90}
                              paddingAngle={3}
                            >
                              {analytics.categoryBreakdown.map(
                                (_, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      PIE_COLORS[
                                        index %
                                          PIE_COLORS.length
                                      ]
                                    }
                                  />
                                )
                              )}
                            </Pie>

                            <Tooltip
                              formatter={(value) =>
                                `₹${Number(
                                  value
                                ).toLocaleString("en-IN")}`
                              }
                              contentStyle={{
                                borderRadius: "10px",
                                border: `1px solid ${theme.colors.border}`,
                                fontSize: "12px",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div style={categoryListStyle}>
                        {analytics.categoryBreakdown.map(
                          (item, index) => {
                            const totalExpenses =
                              analytics.summary.totalExpense;

                            const percentage =
                              totalExpenses > 0
                                ? (item.amount /
                                    totalExpenses) *
                                  100
                                : 0;

                            return (
                              <div
                                key={item.category}
                                style={categoryRowStyle}
                              >
                                <div
                                  style={categoryIdentityStyle}
                                >
                                  <span
                                    style={{
                                      ...categoryDotStyle,
                                      background:
                                        PIE_COLORS[
                                          index %
                                            PIE_COLORS.length
                                        ],
                                    }}
                                  />

                                  <div>
                                    <strong
                                      style={categoryNameStyle}
                                    >
                                      {item.category}
                                    </strong>

                                    <p
                                      style={
                                        categoryPercentageStyle
                                      }
                                    >
                                      {percentage.toFixed(1)}% of
                                      expenses
                                    </p>
                                  </div>
                                </div>

                                <strong
                                  style={categoryAmountStyle}
                                >
                                  ₹
                                  {item.amount.toLocaleString(
                                    "en-IN"
                                  )}
                                </strong>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </>
                  )}
                </div>
              </section>

              <section style={insightsSectionStyle}>
                <div style={insightsHeadingStyle}>
                  <div>
                    <p style={sectionEyebrowStyle}>
                      KEY INSIGHTS
                    </p>

                    <h2 style={textStyles.sectionTitle}>
                      Financial Snapshot
                    </h2>

                    <p style={descriptionStyle}>
                      Quick insights based on your {year} activity
                    </p>
                  </div>
                </div>

                <div style={insightsGridStyle}>
                  <InsightCard
                    title="Highest Spending Category"
                    headline={
                      analytics.highestExpenseCategory
                        ? analytics.highestExpenseCategory
                            .category
                        : "No expenses"
                    }
                    value={
                      analytics.highestExpenseCategory
                        ? `₹${analytics.highestExpenseCategory.amount.toLocaleString(
                            "en-IN"
                          )}`
                        : "₹0"
                    }
                    icon={<Target size={20} />}
                    color={theme.colors.warning}
                    background={theme.colors.warningSoft}
                  />

                  <InsightCard
                    title="Financial Status"
                    headline={financialStatus}
                    value={`${analytics.summary.savingsRate.toFixed(
                      1
                    )}% savings rate`}
                    icon={<TrendingUp size={20} />}
                    color={
                      analytics.summary.savingsRate >= 20
                        ? theme.colors.success
                        : analytics.summary.savingsRate > 0
                          ? theme.colors.warning
                          : theme.colors.danger
                    }
                    background={
                      analytics.summary.savingsRate >= 20
                        ? theme.colors.successSoft
                        : analytics.summary.savingsRate > 0
                          ? theme.colors.warningSoft
                          : theme.colors.dangerSoft
                    }
                  />

                  <InsightCard
                    title="Net Savings"
                    headline={
                      analytics.summary.savings >= 0
                        ? "Surplus"
                        : "Deficit"
                    }
                    value={`₹${Math.abs(
                      analytics.summary.savings
                    ).toLocaleString("en-IN")}`}
                    icon={<CircleDollarSign size={20} />}
                    color={
                      analytics.summary.savings >= 0
                        ? theme.colors.success
                        : theme.colors.danger
                    }
                    background={
                      analytics.summary.savings >= 0
                        ? theme.colors.successSoft
                        : theme.colors.dangerSoft
                    }
                  />
                </div>
              </section>
            </>
          )
        )}
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
  value: string;
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

      <h2 style={summaryValueStyle}>{value}</h2>

      <p style={summarySubtitleStyle}>{subtitle}</p>
    </div>
  );
}

function InsightCard({
  title,
  headline,
  value,
  icon,
  color,
  background,
}: {
  title: string;
  headline: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  background: string;
}) {
  return (
    <div style={insightCardStyle}>
      <div
        style={{
          ...insightIconStyle,
          color,
          background,
        }}
      >
        {icon}
      </div>

      <p style={insightLabelStyle}>{title}</p>

      <h3 style={insightHeadlineStyle}>
        {headline}
      </h3>

      <p style={{ ...insightValueStyle, color }}>
        {value}
      </p>
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

const sectionEyebrowStyle = {
  margin: "0 0 7px",
  color: theme.colors.primary,
  fontSize: "9px",
  fontWeight: 800,
  letterSpacing: "1.3px",
};

const descriptionStyle = {
  margin: "7px 0 0",
  color: theme.colors.textMuted,
  fontSize: "12px",
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

const yearSelectStyle = {
  minWidth: "120px",
  padding: "10px 35px 10px 12px",
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.medium,
  background: theme.colors.surface,
  color: theme.colors.text,
  outline: "none",
  cursor: "pointer",
};

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "18px",
  marginBottom: "24px",
};

const summaryCardStyle = {
  ...cardStyles.paddedCard,
  minWidth: 0,
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
  fontSize: "23px",
  letterSpacing: "-0.6px",
};

const summarySubtitleStyle = {
  margin: 0,
  color: theme.colors.textMuted,
  fontSize: "11px",
};

const chartsGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "24px",
  marginBottom: "24px",
  alignItems: "start",
};

const chartHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  marginBottom: "10px",
};

const chartIconStyle = {
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

const barChartWrapperStyle = {
  width: "100%",
  height: "350px",
  minWidth: 0,
  marginTop: "10px",
};

const pieChartWrapperStyle = {
  width: "100%",
  height: "250px",
  minWidth: 0,
};

const categoryListStyle = {
  display: "flex",
  flexDirection: "column" as const,
};

const categoryRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px",
  padding: "12px 0",
  borderTop: `1px solid ${theme.colors.borderLight}`,
};

const categoryIdentityStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  minWidth: 0,
};

const categoryDotStyle = {
  width: "10px",
  height: "10px",
  flexShrink: 0,
  borderRadius: "50%",
};

const categoryNameStyle = {
  color: theme.colors.text,
  fontSize: "12px",
};

const categoryPercentageStyle = {
  margin: "3px 0 0",
  color: theme.colors.textMuted,
  fontSize: "9px",
};

const categoryAmountStyle = {
  color: theme.colors.text,
  fontSize: "12px",
  whiteSpace: "nowrap" as const,
};

const insightsSectionStyle = {
  ...cardStyles.paddedCard,
};

const insightsHeadingStyle = {
  marginBottom: "18px",
};

const insightsGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "14px",
};

const insightCardStyle = {
  padding: "18px",
  borderRadius: theme.radius.medium,
  background: theme.colors.surfaceSoft,
};

const insightIconStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "11px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "15px",
};

const insightLabelStyle = {
  margin: 0,
  color: theme.colors.textMuted,
  fontSize: "10px",
};

const insightHeadlineStyle = {
  margin: "7px 0 5px",
  color: theme.colors.text,
  fontSize: "15px",
};

const insightValueStyle = {
  margin: 0,
  fontSize: "12px",
  fontWeight: 700,
};

const loadingCardStyle = {
  ...cardStyles.paddedCard,
  padding: "70px 20px",
  textAlign: "center" as const,
};

const loadingIconStyle = {
  width: "54px",
  height: "54px",
  margin: "0 auto 15px",
  borderRadius: "15px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: theme.colors.primarySoft,
  color: theme.colors.primary,
};

const loadingTitleStyle = {
  margin: "0 0 7px",
  color: theme.colors.text,
};

const loadingTextStyle = {
  margin: 0,
  color: theme.colors.textMuted,
  fontSize: "12px",
};

const emptyChartStyle = {
  minHeight: "330px",
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center" as const,
};

const emptyIconStyle = {
  width: "52px",
  height: "52px",
  marginBottom: "14px",
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
  fontSize: "12px",
};

const errorStyle = {
  padding: "12px 14px",
  marginBottom: "20px",
  borderRadius: theme.radius.small,
  background: theme.colors.dangerSoft,
  color: theme.colors.danger,
  fontSize: "12px",
  fontWeight: 600,
};

export default Reports;