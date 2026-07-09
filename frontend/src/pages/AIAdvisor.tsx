import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

type Advice = {
  type: "success" | "warning" | "danger" | "info";
  title: string;
  message: string;
};

type AdvisorData = {
  summary: {
    totalIncome: number;
    totalExpense: number;
    savings: number;
    savingsRate: number;
  };
  advice: Advice[];
};

type AIAdvisorProps = {
  onLogout: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
};

function AIAdvisor({
  onLogout,
  activePage,
  setActivePage,
}: AIAdvisorProps) {
  const [data, setData] = useState<AdvisorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchAdvice = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/api/advisor");

      setData(response.data);
    } catch (error: any) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Could not load financial advice"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onLogout();
  };

  return (
    <div style={pageStyle}>
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main style={mainStyle}>
        <div style={headerStyle}>
          <div>
            <h1 style={{ margin: 0 }}>
              AI Financial Advisor
            </h1>

            <p style={subtitleStyle}>
              Personalized insights based on your financial data.
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={logoutButtonStyle}
          >
            Logout
          </button>
        </div>

        {message && (
          <div style={errorStyle}>
            {message}
          </div>
        )}

        {loading ? (
          <div style={cardStyle}>
            <h2>Analyzing your finances...</h2>

            <p style={subtitleStyle}>
              Reviewing transactions, savings, goals, and investments.
            </p>
          </div>
        ) : (
          data && (
            <>
              <div style={heroCardStyle}>
                <div>
                  <p style={heroLabelStyle}>
                    FINWISE FINANCIAL HEALTH
                  </p>

                  <h2 style={heroTitleStyle}>
                    {data.summary.savingsRate >= 20
                      ? "Your finances are in a strong position"
                      : data.summary.savingsRate > 0
                        ? "You are saving, but there is room to improve"
                        : "Your spending needs attention"}
                  </h2>

                  <p style={heroTextStyle}>
                    Your current savings rate is{" "}
                    <strong>
                      {data.summary.savingsRate.toFixed(2)}%
                    </strong>
                    . The recommendations below are generated from
                    your current FinWise data.
                  </p>
                </div>

                <button
                  onClick={fetchAdvice}
                  style={refreshButtonStyle}
                >
                  Refresh Insights
                </button>
              </div>

              <div style={summaryGridStyle}>
                <SummaryCard
                  title="Total Income"
                  value={`₹${data.summary.totalIncome.toLocaleString(
                    "en-IN"
                  )}`}
                />

                <SummaryCard
                  title="Total Expenses"
                  value={`₹${data.summary.totalExpense.toLocaleString(
                    "en-IN"
                  )}`}
                />

                <SummaryCard
                  title="Net Savings"
                  value={`₹${data.summary.savings.toLocaleString(
                    "en-IN"
                  )}`}
                  positive={data.summary.savings >= 0}
                />

                <SummaryCard
                  title="Savings Rate"
                  value={`${data.summary.savingsRate.toFixed(2)}%`}
                  positive={data.summary.savingsRate >= 20}
                />
              </div>

              <section>
                <div style={sectionHeaderStyle}>
                  <div>
                    <h2 style={{ margin: 0 }}>
                      Personalized Insights
                    </h2>

                    <p style={subtitleStyle}>
                      Recommendations based on your current activity.
                    </p>
                  </div>

                  <span style={insightCountStyle}>
                    {data.advice.length} insights
                  </span>
                </div>

                {data.advice.length === 0 ? (
                  <div style={cardStyle}>
                    No insights available yet. Add more financial data
                    to receive recommendations.
                  </div>
                ) : (
                  <div style={adviceGridStyle}>
                    {data.advice.map((item, index) => (
                      <AdviceCard
                        key={`${item.title}-${index}`}
                        advice={item}
                      />
                    ))}
                  </div>
                )}
              </section>

              <div style={disclaimerStyle}>
                <strong>About these insights:</strong>{" "}
                FinWise analyzes the financial information stored in
                your account. These insights are for personal finance
                tracking and educational purposes, not professional
                financial advice.
              </div>
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
  positive,
}: {
  title: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div style={summaryCardStyle}>
      <p style={summaryLabelStyle}>{title}</p>

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

function AdviceCard({
  advice,
}: {
  advice: Advice;
}) {
  const theme = getAdviceTheme(advice.type);

  return (
    <div
      style={{
        ...adviceCardStyle,
        borderLeft: `5px solid ${theme.accent}`,
      }}
    >
      <div
        style={{
          ...adviceBadgeStyle,
          background: theme.background,
          color: theme.accent,
        }}
      >
        {theme.label}
      </div>

      <h3 style={adviceTitleStyle}>
        {advice.title}
      </h3>

      <p style={adviceMessageStyle}>
        {advice.message}
      </p>
    </div>
  );
}

function getAdviceTheme(type: Advice["type"]) {
  if (type === "success") {
    return {
      label: "Positive",
      accent: "#15803d",
      background: "#dcfce7",
    };
  }

  if (type === "warning") {
    return {
      label: "Suggestion",
      accent: "#b45309",
      background: "#fef3c7",
    };
  }

  if (type === "danger") {
    return {
      label: "Attention",
      accent: "#dc2626",
      background: "#fee2e2",
    };
  }

  return {
    label: "Insight",
    accent: "#2563eb",
    background: "#dbeafe",
  };
}

const pageStyle = {
  display: "flex",
  minHeight: "100vh",
  background: "#f3f4f6",
};

const mainStyle = {
  flex: 1,
  padding: "32px",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  marginBottom: "30px",
};

const subtitleStyle = {
  color: "#6b7280",
  marginTop: "8px",
};

const heroCardStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "24px",
  padding: "28px",
  marginBottom: "24px",
  background:
    "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
  color: "white",
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
};

const heroLabelStyle = {
  margin: 0,
  fontSize: "12px",
  letterSpacing: "1.5px",
  color: "#93c5fd",
  fontWeight: "bold",
};

const heroTitleStyle = {
  margin: "10px 0",
  fontSize: "26px",
};

const heroTextStyle = {
  margin: 0,
  color: "#d1d5db",
  lineHeight: 1.6,
  maxWidth: "700px",
};

const refreshButtonStyle = {
  padding: "11px 16px",
  background: "white",
  color: "#111827",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  whiteSpace: "nowrap" as const,
};

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "16px",
  marginBottom: "30px",
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

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  marginBottom: "18px",
};

const insightCountStyle = {
  padding: "7px 12px",
  background: "#e5e7eb",
  borderRadius: "999px",
  color: "#4b5563",
  fontSize: "13px",
  fontWeight: "bold",
};

const adviceGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "18px",
};

const adviceCardStyle = {
  background: "white",
  padding: "22px",
  borderRadius: "14px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
};

const adviceBadgeStyle = {
  display: "inline-block",
  padding: "5px 9px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "bold",
};

const adviceTitleStyle = {
  margin: "16px 0 8px",
};

const adviceMessageStyle = {
  margin: 0,
  color: "#6b7280",
  lineHeight: 1.6,
};

const cardStyle = {
  background: "white",
  padding: "24px",
  borderRadius: "14px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
};

const errorStyle = {
  background: "#fee2e2",
  color: "#b91c1c",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "20px",
};

const disclaimerStyle = {
  marginTop: "24px",
  padding: "16px",
  background: "#eff6ff",
  color: "#1e3a8a",
  borderRadius: "10px",
  lineHeight: 1.6,
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

export default AIAdvisor;