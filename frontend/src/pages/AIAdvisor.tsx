import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  CircleDollarSign,
  Info,
  Lightbulb,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import api from "../services/api";
import Sidebar from "../components/Sidebar";

import {
  buttonStyles,
  cardStyles,
  layoutStyles,
  textStyles,
  theme,
} from "../styles/theme";

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

  const getHealthData = () => {
    if (!data) {
      return {
        title: "",
        description: "",
        label: "",
        color: theme.colors.primary,
        background: theme.colors.primarySoft,
      };
    }

    if (data.summary.savingsRate >= 20) {
      return {
        title: "Your finances are in a strong position",
        description:
          "You are maintaining a healthy savings rate. Keep building on this momentum.",
        label: "Strong Financial Health",
        color: theme.colors.success,
        background: theme.colors.successSoft,
      };
    }

    if (data.summary.savingsRate > 0) {
      return {
        title: "You are saving, with room to improve",
        description:
          "Your cash flow is positive. A few spending adjustments could strengthen your savings rate.",
        label: "Positive Financial Health",
        color: theme.colors.warning,
        background: theme.colors.warningSoft,
      };
    }

    return {
      title: "Your spending needs attention",
      description:
        "Your expenses are currently reducing your financial flexibility. Review the insights below.",
      label: "Needs Attention",
      color: theme.colors.danger,
      background: theme.colors.dangerSoft,
    };
  };

  const health = getHealthData();

  return (
    <div style={layoutStyles.page}>
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main style={layoutStyles.main}>
        <header style={layoutStyles.pageHeader}>
          <div>
            <p style={eyebrowStyle}>SMART FINANCIAL GUIDANCE</p>

            <h1 style={layoutStyles.pageTitle}>
              AI Financial Advisor
            </h1>

            <p style={layoutStyles.pageSubtitle}>
              Personalized insights based on your FinWise data.
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

        {message && <div style={errorStyle}>{message}</div>}

        {loading ? (
          <div style={loadingCardStyle}>
            <div style={loadingIconStyle}>
              <Bot size={28} />
            </div>

            <p style={loadingEyebrowStyle}>
              FINWISE IS ANALYZING
            </p>

            <h2 style={loadingTitleStyle}>
              Reviewing your finances...
            </h2>

            <p style={loadingTextStyle}>
              Analysing transactions, savings, goals, and
              investments to prepare your insights.
            </p>
          </div>
        ) : (
          data && (
            <>
              <section style={heroCardStyle}>
                <div style={heroContentStyle}>
                  <div style={heroBadgeStyle}>
                    <Sparkles size={14} />
                    AI-POWERED FINANCIAL HEALTH
                  </div>

                  <h2 style={heroTitleStyle}>
                    {health.title}
                  </h2>

                  <p style={heroTextStyle}>
                    {health.description}
                  </p>

                  <div style={healthStatusStyle}>
                    <span
                      style={{
                        ...healthDotStyle,
                        background: health.color,
                      }}
                    />

                    <span>{health.label}</span>
                  </div>
                </div>

                <div style={heroActionStyle}>
                  <div style={rateCircleStyle}>
                    <span style={rateLabelStyle}>
                      SAVINGS RATE
                    </span>

                    <strong style={rateValueStyle}>
                      {data.summary.savingsRate.toFixed(1)}%
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={fetchAdvice}
                    style={refreshButtonStyle}
                  >
                    <RefreshCw size={16} />
                    Refresh Insights
                  </button>
                </div>
              </section>

              <section style={summaryGridStyle}>
                <SummaryCard
                  title="Total Income"
                  value={`₹${data.summary.totalIncome.toLocaleString(
                    "en-IN"
                  )}`}
                  subtitle="Money received"
                  icon={<ArrowUpRight size={20} />}
                  color={theme.colors.success}
                  background={theme.colors.successSoft}
                />

                <SummaryCard
                  title="Total Expenses"
                  value={`₹${data.summary.totalExpense.toLocaleString(
                    "en-IN"
                  )}`}
                  subtitle="Money spent"
                  icon={<ArrowDownRight size={20} />}
                  color={theme.colors.danger}
                  background={theme.colors.dangerSoft}
                />

                <SummaryCard
                  title="Net Savings"
                  value={`${
                    data.summary.savings < 0 ? "-" : ""
                  }₹${Math.abs(
                    data.summary.savings
                  ).toLocaleString("en-IN")}`}
                  subtitle={
                    data.summary.savings >= 0
                      ? "Positive cash flow"
                      : "Expenses exceed income"
                  }
                  icon={<CircleDollarSign size={20} />}
                  color={
                    data.summary.savings >= 0
                      ? theme.colors.success
                      : theme.colors.danger
                  }
                  background={
                    data.summary.savings >= 0
                      ? theme.colors.successSoft
                      : theme.colors.dangerSoft
                  }
                />

                <SummaryCard
                  title="Savings Rate"
                  value={`${data.summary.savingsRate.toFixed(1)}%`}
                  subtitle={health.label}
                  icon={<TrendingUp size={20} />}
                  color={health.color}
                  background={health.background}
                />
              </section>

              <section style={insightsSectionStyle}>
                <div style={sectionHeaderStyle}>
                  <div>
                    <p style={sectionEyebrowStyle}>
                      PERSONALIZED ANALYSIS
                    </p>

                    <h2 style={textStyles.sectionTitle}>
                      Your Financial Insights
                    </h2>

                    <p style={descriptionStyle}>
                      Recommendations generated from your current
                      financial activity.
                    </p>
                  </div>

                  <div style={insightCountStyle}>
                    <Lightbulb size={15} />
                    {data.advice.length} Insight
                    {data.advice.length === 1 ? "" : "s"}
                  </div>
                </div>

                {data.advice.length === 0 ? (
                  <div style={emptyStateStyle}>
                    <div style={emptyIconStyle}>
                      <Bot size={25} />
                    </div>

                    <h3 style={emptyTitleStyle}>
                      More data needed
                    </h3>

                    <p style={emptyTextStyle}>
                      Add more transactions, goals, or investments
                      to receive personalized recommendations.
                    </p>
                  </div>
                ) : (
                  <div style={adviceGridStyle}>
                    {data.advice.map((item, index) => (
                      <AdviceCard
                        key={`${item.title}-${index}`}
                        advice={item}
                        number={index + 1}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section style={disclaimerStyle}>
                <div style={disclaimerIconStyle}>
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <strong style={disclaimerTitleStyle}>
                    About these insights
                  </strong>

                  <p style={disclaimerTextStyle}>
                    FinWise analyses the financial information stored
                    in your account. These insights are for personal
                    finance tracking and educational purposes, not
                    professional financial advice.
                  </p>
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

function AdviceCard({
  advice,
  number,
}: {
  advice: Advice;
  number: number;
}) {
  const adviceTheme = getAdviceTheme(advice.type);

  return (
    <div style={adviceCardStyle}>
      <div style={adviceTopRowStyle}>
        <div
          style={{
            ...adviceIconStyle,
            color: adviceTheme.color,
            background: adviceTheme.background,
          }}
        >
          {adviceTheme.icon}
        </div>

        <span
          style={{
            ...adviceBadgeStyle,
            color: adviceTheme.color,
            background: adviceTheme.background,
          }}
        >
          {adviceTheme.label}
        </span>
      </div>

      <p style={insightNumberStyle}>
        INSIGHT {number.toString().padStart(2, "0")}
      </p>

      <h3 style={adviceTitleStyle}>{advice.title}</h3>

      <p style={adviceMessageStyle}>{advice.message}</p>

      <div
        style={{
          ...adviceAccentStyle,
          background: adviceTheme.color,
        }}
      />
    </div>
  );
}

function getAdviceTheme(type: Advice["type"]) {
  if (type === "success") {
    return {
      label: "Positive",
      color: theme.colors.success,
      background: theme.colors.successSoft,
      icon: <CheckCircle2 size={19} />,
    };
  }

  if (type === "warning") {
    return {
      label: "Suggestion",
      color: theme.colors.warning,
      background: theme.colors.warningSoft,
      icon: <Lightbulb size={19} />,
    };
  }

  if (type === "danger") {
    return {
      label: "Attention",
      color: theme.colors.danger,
      background: theme.colors.dangerSoft,
      icon: <AlertTriangle size={19} />,
    };
  }

  return {
    label: "Insight",
    color: theme.colors.info,
    background: theme.colors.infoSoft,
    icon: <Info size={19} />,
  };
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

const heroCardStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "28px",
  padding: "30px",
  marginBottom: "24px",
  background:
    "linear-gradient(135deg, #111827 0%, #1f2937 60%, #172554 100%)",
  color: "#ffffff",
  borderRadius: theme.radius.large,
  boxShadow: theme.shadow.medium,
  flexWrap: "wrap" as const,
};

const heroContentStyle = {
  flex: "1 1 420px",
  minWidth: 0,
};

const heroBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 9px",
  marginBottom: "16px",
  borderRadius: theme.radius.pill,
  background: "rgba(147, 197, 253, 0.12)",
  color: "#93c5fd",
  fontSize: "9px",
  fontWeight: 800,
  letterSpacing: "1px",
};

const heroTitleStyle = {
  margin: "0 0 12px",
  maxWidth: "650px",
  fontSize: "clamp(22px, 3vw, 32px)",
  lineHeight: 1.2,
  letterSpacing: "-0.8px",
};

const heroTextStyle = {
  maxWidth: "650px",
  margin: 0,
  color: "#cbd5e1",
  fontSize: "13px",
  lineHeight: 1.7,
};

const healthStatusStyle = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  marginTop: "18px",
  color: "#e5e7eb",
  fontSize: "11px",
  fontWeight: 700,
};

const healthDotStyle = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
};

const heroActionStyle = {
  flex: "0 1 220px",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "stretch",
  gap: "12px",
};

const rateCircleStyle = {
  padding: "18px",
  borderRadius: "15px",
  background: "rgba(255, 255, 255, 0.08)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  textAlign: "center" as const,
};

const rateLabelStyle = {
  display: "block",
  marginBottom: "7px",
  color: "#94a3b8",
  fontSize: "9px",
  fontWeight: 800,
  letterSpacing: "1px",
};

const rateValueStyle = {
  fontSize: "29px",
  letterSpacing: "-1px",
};

const refreshButtonStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "7px",
  padding: "11px 14px",
  border: "none",
  borderRadius: theme.radius.medium,
  background: "#ffffff",
  color: "#111827",
  cursor: "pointer",
  fontSize: "11px",
  fontWeight: 800,
};

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(190px, 1fr))",
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
  fontSize: "24px",
  letterSpacing: "-0.6px",
};

const summarySubtitleStyle = {
  margin: 0,
  color: theme.colors.textMuted,
  fontSize: "11px",
};

const insightsSectionStyle = {
  ...cardStyles.paddedCard,
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "18px",
  marginBottom: "20px",
  flexWrap: "wrap" as const,
};

const insightCountStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "7px 10px",
  borderRadius: theme.radius.pill,
  background: theme.colors.primarySoft,
  color: theme.colors.primary,
  fontSize: "11px",
  fontWeight: 700,
};

const adviceGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "16px",
};

const adviceCardStyle = {
  position: "relative" as const,
  overflow: "hidden",
  padding: "20px",
  border: `1px solid ${theme.colors.borderLight}`,
  borderRadius: theme.radius.medium,
  background: theme.colors.surface,
};

const adviceTopRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10px",
};

const adviceIconStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "11px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const adviceBadgeStyle = {
  padding: "5px 9px",
  borderRadius: theme.radius.pill,
  fontSize: "9px",
  fontWeight: 800,
};

const insightNumberStyle = {
  margin: "18px 0 7px",
  color: theme.colors.textMuted,
  fontSize: "8px",
  fontWeight: 800,
  letterSpacing: "1.2px",
};

const adviceTitleStyle = {
  margin: "0 0 9px",
  color: theme.colors.text,
  fontSize: "15px",
};

const adviceMessageStyle = {
  margin: 0,
  color: theme.colors.textSecondary,
  fontSize: "12px",
  lineHeight: 1.65,
};

const adviceAccentStyle = {
  position: "absolute" as const,
  left: 0,
  bottom: 0,
  width: "100%",
  height: "3px",
};

const disclaimerStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  marginTop: "24px",
  padding: "17px",
  borderRadius: theme.radius.medium,
  background: theme.colors.infoSoft,
  color: theme.colors.info,
};

const disclaimerIconStyle = {
  flexShrink: 0,
  marginTop: "1px",
};

const disclaimerTitleStyle = {
  display: "block",
  marginBottom: "5px",
  fontSize: "12px",
};

const disclaimerTextStyle = {
  margin: 0,
  fontSize: "11px",
  lineHeight: 1.6,
};

const loadingCardStyle = {
  ...cardStyles.paddedCard,
  padding: "75px 20px",
  textAlign: "center" as const,
};

const loadingIconStyle = {
  width: "58px",
  height: "58px",
  margin: "0 auto 16px",
  borderRadius: "17px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: theme.colors.primarySoft,
  color: theme.colors.primary,
};

const loadingEyebrowStyle = {
  margin: "0 0 8px",
  color: theme.colors.primary,
  fontSize: "9px",
  fontWeight: 800,
  letterSpacing: "1.3px",
};

const loadingTitleStyle = {
  margin: "0 0 8px",
  color: theme.colors.text,
};

const loadingTextStyle = {
  maxWidth: "430px",
  margin: "0 auto",
  color: theme.colors.textMuted,
  fontSize: "12px",
  lineHeight: 1.6,
};

const emptyStateStyle = {
  padding: "55px 20px",
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
  maxWidth: "420px",
  margin: "0 auto",
  color: theme.colors.textMuted,
  fontSize: "12px",
  lineHeight: 1.6,
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

export default AIAdvisor;