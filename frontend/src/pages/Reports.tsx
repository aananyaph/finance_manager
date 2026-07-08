import { useEffect, useState } from "react";
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

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#f3f4f6",
        }}
      >
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
        />

        <main style={{ flex: 1, padding: "32px" }}>
          <h2>Loading reports...</h2>
        </main>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f3f4f6",
      }}
    >
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main style={{ flex: 1, padding: "32px" }}>
        <div style={headerStyle}>
          <div>
            <h1 style={{ margin: 0 }}>
              Reports & Analytics
            </h1>

            <p style={{ color: "#6b7280" }}>
              Understand your income, spending, and savings.
            </p>
          </div>

          <div style={headerActionsStyle}>
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

            <button
              onClick={handleLogout}
              style={logoutButtonStyle}
            >
              Logout
            </button>
          </div>
        </div>

        {message && (
          <div style={errorStyle}>
            {message}
          </div>
        )}

        {analytics && (
          <>
            <div style={summaryGridStyle}>
              <SummaryCard
                title="Total Income"
                value={`₹${analytics.summary.totalIncome.toLocaleString(
                  "en-IN"
                )}`}
              />

              <SummaryCard
                title="Total Expenses"
                value={`₹${analytics.summary.totalExpense.toLocaleString(
                  "en-IN"
                )}`}
              />

              <SummaryCard
                title="Total Savings"
                value={`₹${analytics.summary.savings.toLocaleString(
                  "en-IN"
                )}`}
                positive={analytics.summary.savings >= 0}
              />

              <SummaryCard
                title="Savings Rate"
                value={`${analytics.summary.savingsRate.toFixed(
                  2
                )}%`}
                positive={
                  analytics.summary.savingsRate >= 0
                }
              />

              <SummaryCard
                title="Transactions"
                value={analytics.summary.transactionCount.toString()}
              />
            </div>

            <div style={chartsGridStyle}>
              <section style={chartCardStyle}>
                <div style={chartHeaderStyle}>
                  <div>
                    <h2 style={{ margin: 0 }}>
                      Income vs Expenses
                    </h2>

                    <p style={chartDescriptionStyle}>
                      Monthly financial activity for {year}
                    </p>
                  </div>
                </div>

                <div style={{ width: "100%", height: 360 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={analytics.monthlyData}
                      margin={{
                        top: 20,
                        right: 20,
                        left: 10,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                      />

                      <XAxis dataKey="month" />

                      <YAxis />

                      <Tooltip
                        formatter={(value) =>
                          `₹${Number(
                            value
                          ).toLocaleString("en-IN")}`
                        }
                      />

                      <Legend />

                      <Bar
                        dataKey="income"
                        name="Income"
                        fill="#16a34a"
                        radius={[6, 6, 0, 0]}
                      />

                      <Bar
                        dataKey="expense"
                        name="Expense"
                        fill="#dc2626"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section style={chartCardStyle}>
                <h2 style={{ marginTop: 0 }}>
                  Expense Categories
                </h2>

                <p style={chartDescriptionStyle}>
                  Where your money was spent
                </p>

                {analytics.categoryBreakdown.length ===
                0 ? (
                  <div style={emptyChartStyle}>
                    No expense data for {year}
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        width: "100%",
                        height: 280,
                      }}
                    >
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={
                              analytics.categoryBreakdown
                            }
                            dataKey="amount"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={({ name }) => name}
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
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div style={categoryListStyle}>
                      {analytics.categoryBreakdown.map(
                        (item, index) => (
                          <div
                            key={item.category}
                            style={categoryRowStyle}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <span
                                style={{
                                  width: "12px",
                                  height: "12px",
                                  borderRadius: "50%",
                                  background:
                                    PIE_COLORS[
                                      index %
                                        PIE_COLORS.length
                                    ],
                                }}
                              />

                              <span>
                                {item.category}
                              </span>
                            </div>

                            <strong>
                              ₹
                              {item.amount.toLocaleString(
                                "en-IN"
                              )}
                            </strong>
                          </div>
                        )
                      )}
                    </div>
                  </>
                )}
              </section>
            </div>

            <div style={insightsGridStyle}>
              <section style={insightCardStyle}>
                <p style={insightLabelStyle}>
                  Highest Spending Category
                </p>

                <h2>
                  {analytics.highestExpenseCategory
                    ? analytics.highestExpenseCategory
                        .category
                    : "No expenses"}
                </h2>

                <p style={insightValueStyle}>
                  {analytics.highestExpenseCategory
                    ? `₹${analytics.highestExpenseCategory.amount.toLocaleString(
                        "en-IN"
                      )}`
                    : "₹0"}
                </p>
              </section>

              <section style={insightCardStyle}>
                <p style={insightLabelStyle}>
                  Financial Status
                </p>

                <h2>
                  {analytics.summary.savingsRate >= 20
                    ? "Strong Savings"
                    : analytics.summary.savingsRate > 0
                      ? "Positive Savings"
                      : "Needs Attention"}
                </h2>

                <p style={insightValueStyle}>
                  {analytics.summary.savingsRate.toFixed(
                    2
                  )}
                  % savings rate
                </p>
              </section>

              <section style={insightCardStyle}>
                <p style={insightLabelStyle}>
                  Net Savings
                </p>

                <h2>
                  {analytics.summary.savings >= 0
                    ? "Surplus"
                    : "Deficit"}
                </h2>

                <p style={insightValueStyle}>
                  ₹
                  {Math.abs(
                    analytics.summary.savings
                  ).toLocaleString("en-IN")}
                </p>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

type SummaryCardProps = {
  title: string;
  value: string;
  positive?: boolean;
};

function SummaryCard({
  title,
  value,
  positive,
}: SummaryCardProps) {
  return (
    <div style={summaryCardStyle}>
      <p style={summaryLabelStyle}>
        {title}
      </p>

      <h2
        style={{
          marginBottom: 0,
          color:
            positive === undefined
              ? "#111827"
              : positive
                ? "#16a34a"
                : "#dc2626",
        }}
      >
        {value}
      </h2>
    </div>
  );
}

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  marginBottom: "30px",
};

const headerActionsStyle = {
  display: "flex",
  gap: "12px",
  alignItems: "center",
};

const yearSelectStyle = {
  padding: "10px 14px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  background: "white",
  cursor: "pointer",
};

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(170px, 1fr))",
  gap: "16px",
  marginBottom: "24px",
};

const summaryCardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "14px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
};

const summaryLabelStyle = {
  margin: 0,
  color: "#6b7280",
  fontSize: "14px",
};

const chartsGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "minmax(0, 2fr) minmax(320px, 1fr)",
  gap: "24px",
  marginBottom: "24px",
};

const chartCardStyle = {
  background: "white",
  padding: "24px",
  borderRadius: "14px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
  minWidth: 0,
};

const chartHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const chartDescriptionStyle = {
  color: "#6b7280",
  marginTop: "8px",
};

const categoryListStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "12px",
};

const categoryRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingTop: "10px",
  borderTop: "1px solid #f3f4f6",
};

const insightsGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
};

const insightCardStyle = {
  background: "white",
  padding: "22px",
  borderRadius: "14px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
};

const insightLabelStyle = {
  margin: 0,
  color: "#6b7280",
  fontSize: "14px",
};

const insightValueStyle = {
  color: "#6b7280",
  marginBottom: 0,
};

const emptyChartStyle = {
  height: "280px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "#6b7280",
};

const errorStyle = {
  background: "#fee2e2",
  color: "#b91c1c",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "20px",
};

const logoutButtonStyle = {
  padding: "10px 20px",
  background: "#dc2626",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

export default Reports;