import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Coins,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  TrendingUp,
  Wallet,
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

type Investment = {
  _id: string;
  assetType: string;
  name: string;
  symbol: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  purchaseDate: string;
  investedValue: number;
  currentValue: number;
  profitLoss: number;
  returnPercentage: number;
};

type PortfolioSummary = {
  totalInvested: number;
  totalCurrentValue: number;
  totalProfitLoss: number;
  totalReturnPercentage: number;
  totalHoldings: number;
};

type InvestmentsProps = {
  onLogout: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
};

function Investments({
  onLogout,
  activePage,
  setActivePage,
}: InvestmentsProps) {
  const [investments, setInvestments] = useState<Investment[]>(
    []
  );

  const [summary, setSummary] = useState<PortfolioSummary>({
    totalInvested: 0,
    totalCurrentValue: 0,
    totalProfitLoss: 0,
    totalReturnPercentage: 0,
    totalHoldings: 0,
  });

  const [assetType, setAssetType] = useState("Stock");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [averageBuyPrice, setAverageBuyPrice] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");

  const [editingId, setEditingId] = useState<string | null>(
    null
  );

  const [refreshingId, setRefreshingId] = useState<
    string | null
  >(null);

  const [message, setMessage] = useState("");

  const fetchInvestments = async () => {
    try {
      const response = await api.get("/api/investments");
      setInvestments(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Could not load investments");
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await api.get(
        "/api/investments/summary"
      );

      setSummary(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const refreshPortfolio = async () => {
    await Promise.all([fetchInvestments(), fetchSummary()]);
  };

  useEffect(() => {
    refreshPortfolio();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setAssetType("Stock");
    setName("");
    setSymbol("");
    setQuantity("");
    setAverageBuyPrice("");
    setCurrentPrice("");
    setPurchaseDate("");
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const investmentData = {
      assetType,
      name,
      symbol,
      quantity: Number(quantity),
      averageBuyPrice: Number(averageBuyPrice),
      currentPrice: Number(currentPrice),
      purchaseDate: purchaseDate || undefined,
    };

    try {
      if (editingId) {
        await api.put(
          `/api/investments/${editingId}`,
          investmentData
        );

        setMessage("Investment updated successfully!");
      } else {
        await api.post("/api/investments", investmentData);

        setMessage("Investment added successfully!");
      }

      resetForm();
      await refreshPortfolio();
    } catch (error: any) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Could not save investment"
      );
    }
  };

  const handleEdit = (investment: Investment) => {
    setEditingId(investment._id);
    setAssetType(investment.assetType);
    setName(investment.name);
    setSymbol(investment.symbol || "");
    setQuantity(investment.quantity.toString());

    setAverageBuyPrice(
      investment.averageBuyPrice.toString()
    );

    setCurrentPrice(investment.currentPrice.toString());

    setPurchaseDate(
      investment.purchaseDate
        ? investment.purchaseDate.split("T")[0]
        : ""
    );

    setMessage("Editing investment...");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this investment?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/api/investments/${id}`);

      if (editingId === id) {
        resetForm();
      }

      setMessage("Investment deleted successfully!");
      await refreshPortfolio();
    } catch (error) {
      console.error(error);
      setMessage("Could not delete investment");
    }
  };

  const handleRefreshPrice = async (id: string) => {
    try {
      setRefreshingId(id);
      setMessage("Fetching live market price...");

      await api.put(`/api/investments/${id}/refresh-price`);

      await refreshPortfolio();

      setMessage("Live price updated successfully!");
    } catch (error: any) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Could not refresh live price"
      );
    } finally {
      setRefreshingId(null);
    }
  };

  const handleCancelEdit = () => {
    resetForm();
    setMessage("Edit cancelled");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onLogout();
  };

  const portfolioPositive = summary.totalProfitLoss >= 0;

  return (
    <div style={layoutStyles.page}>
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main style={layoutStyles.main}>
        <header style={layoutStyles.pageHeader}>
          <div>
            <p style={eyebrowStyle}>WEALTH TRACKING</p>

            <h1 style={layoutStyles.pageTitle}>
              Investments
            </h1>

            <p style={layoutStyles.pageSubtitle}>
              Track your holdings, live prices, and portfolio
              performance.
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

        <section style={summaryGridStyle}>
          <SummaryCard
            title="Total Invested"
            value={`₹${summary.totalInvested.toLocaleString(
              "en-IN"
            )}`}
            subtitle="Original investment value"
            icon={<Wallet size={20} />}
            color={theme.colors.primary}
            background={theme.colors.primarySoft}
          />

          <SummaryCard
            title="Current Value"
            value={`₹${summary.totalCurrentValue.toLocaleString(
              "en-IN"
            )}`}
            subtitle="Current portfolio worth"
            icon={<BarChart3 size={20} />}
            color={theme.colors.info}
            background={theme.colors.infoSoft}
          />

          <SummaryCard
            title="Profit / Loss"
            value={`${portfolioPositive ? "+" : "-"}₹${Math.abs(
              summary.totalProfitLoss
            ).toLocaleString("en-IN")}`}
            subtitle={
              portfolioPositive
                ? "Portfolio is in profit"
                : "Portfolio is in loss"
            }
            icon={
              portfolioPositive ? (
                <ArrowUpRight size={20} />
              ) : (
                <ArrowDownRight size={20} />
              )
            }
            color={
              portfolioPositive
                ? theme.colors.success
                : theme.colors.danger
            }
            background={
              portfolioPositive
                ? theme.colors.successSoft
                : theme.colors.dangerSoft
            }
          />

          <SummaryCard
            title="Total Return"
            value={`${summary.totalReturnPercentage >= 0 ? "+" : ""}${summary.totalReturnPercentage.toFixed(
              2
            )}%`}
            subtitle={`${summary.totalHoldings} holding${
              summary.totalHoldings === 1 ? "" : "s"
            } tracked`}
            icon={<TrendingUp size={20} />}
            color={
              summary.totalReturnPercentage >= 0
                ? theme.colors.success
                : theme.colors.danger
            }
            background={
              summary.totalReturnPercentage >= 0
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
                  {editingId ? "UPDATE" : "NEW ASSET"}
                </p>

                <h2 style={textStyles.sectionTitle}>
                  {editingId
                    ? "Edit Investment"
                    : "Add Investment"}
                </h2>

                <p style={descriptionStyle}>
                  {editingId
                    ? "Update your holding details."
                    : "Add a new asset to your portfolio."}
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
                Asset Type
              </label>

              <select
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
                style={inputStyles.select}
              >
                <option value="Stock">Stock</option>
                <option value="Mutual Fund">
                  Mutual Fund
                </option>
                <option value="ETF">ETF</option>
                <option value="Crypto">Crypto</option>
                <option value="Fixed Deposit">
                  Fixed Deposit
                </option>
                <option value="Other">Other</option>
              </select>

              <label style={textStyles.label}>
                Investment Name
              </label>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Reliance Industries"
                required
                style={inputStyles.input}
              />

              <label style={textStyles.label}>Symbol</label>

              <input
                value={symbol}
                onChange={(e) =>
                  setSymbol(e.target.value.toUpperCase())
                }
                placeholder="RELIANCE"
                style={inputStyles.input}
              />

              <div style={formTwoColumnStyle}>
                <div>
                  <label style={textStyles.label}>
                    Quantity
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(e.target.value)
                    }
                    placeholder="10"
                    required
                    style={inputStyles.input}
                  />
                </div>

                <div>
                  <label style={textStyles.label}>
                    Purchase Date
                  </label>

                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) =>
                      setPurchaseDate(e.target.value)
                    }
                    style={inputStyles.input}
                  />
                </div>
              </div>

              <label style={textStyles.label}>
                Average Buy Price
              </label>

              <div style={amountWrapperStyle}>
                <span style={currencyStyle}>₹</span>

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={averageBuyPrice}
                  onChange={(e) =>
                    setAverageBuyPrice(e.target.value)
                  }
                  placeholder="0"
                  required
                  style={amountInputStyle}
                />
              </div>

              <label style={textStyles.label}>
                Current Price
              </label>

              <div style={amountWrapperStyle}>
                <span style={currencyStyle}>₹</span>

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={currentPrice}
                  onChange={(e) =>
                    setCurrentPrice(e.target.value)
                  }
                  placeholder="0"
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
                  ? "Update Investment"
                  : "Add Investment"}
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
              <div style={messageStyle}>{message}</div>
            )}
          </div>

          <div style={cardStyles.paddedCard}>
            <div style={holdingsHeaderStyle}>
              <div>
                <p style={sectionEyebrowStyle}>PORTFOLIO</p>

                <h2 style={textStyles.sectionTitle}>
                  Your Holdings
                </h2>

                <p style={descriptionStyle}>
                  {investments.length} asset
                  {investments.length === 1 ? "" : "s"} in your
                  portfolio
                </p>
              </div>

              <div style={portfolioBadgeStyle}>
                <Coins size={15} />
                {summary.totalHoldings} Holdings
              </div>
            </div>

            {investments.length === 0 ? (
              <div style={emptyStateStyle}>
                <div style={emptyIconStyle}>
                  <TrendingUp size={25} />
                </div>

                <h3 style={emptyTitleStyle}>
                  No investments yet
                </h3>

                <p style={emptyTextStyle}>
                  Add your first asset to start tracking your
                  portfolio.
                </p>
              </div>
            ) : (
              <div>
                {investments.map((investment, index) => (
                  <HoldingCard
                    key={investment._id}
                    investment={investment}
                    isLast={index === investments.length - 1}
                    refreshing={
                      refreshingId === investment._id
                    }
                    onRefresh={handleRefreshPrice}
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

      <h2 style={{ ...summaryValueStyle, color }}>
        {value}
      </h2>

      <p style={summarySubtitleStyle}>{subtitle}</p>
    </div>
  );
}

function HoldingCard({
  investment,
  isLast,
  refreshing,
  onRefresh,
  onEdit,
  onDelete,
}: {
  investment: Investment;
  isLast: boolean;
  refreshing: boolean;
  onRefresh: (id: string) => void;
  onEdit: (investment: Investment) => void;
  onDelete: (id: string) => void;
}) {
  const positive = investment.profitLoss >= 0;

  return (
    <div
      style={{
        ...holdingCardStyle,
        borderBottom: isLast
          ? "none"
          : `1px solid ${theme.colors.borderLight}`,
      }}
    >
      <div style={holdingHeaderStyle}>
        <div style={holdingIdentityStyle}>
          <div style={assetIconStyle}>
            <TrendingUp size={20} />
          </div>

          <div>
            <div style={nameRowStyle}>
              <h3 style={holdingNameStyle}>
                {investment.name}
              </h3>

              <span style={assetBadgeStyle}>
                {investment.assetType}
              </span>
            </div>

            <div style={symbolRowStyle}>
              {investment.symbol && (
                <span style={symbolStyle}>
                  {investment.symbol}
                </span>
              )}

              {investment.purchaseDate && (
                <span style={dateStyle}>
                  <CalendarDays size={12} />
                  {formatDate(investment.purchaseDate)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={actionGroupStyle}>
          {investment.assetType === "Stock" &&
            investment.symbol && (
              <button
                type="button"
                onClick={() => onRefresh(investment._id)}
                disabled={refreshing}
                title="Refresh live market price"
                style={{
                  ...refreshButtonStyle,
                  opacity: refreshing ? 0.65 : 1,
                }}
              >
                <RefreshCw size={15} />
                {refreshing ? "Updating..." : "Live Price"}
              </button>
            )}

          <button
            type="button"
            onClick={() => onEdit(investment)}
            title="Edit investment"
            style={editButtonStyle}
          >
            <Pencil size={16} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(investment._id)}
            title="Delete investment"
            style={deleteButtonStyle}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div style={holdingStatsStyle}>
        <HoldingValue
          label="Quantity"
          value={investment.quantity.toLocaleString("en-IN")}
        />

        <HoldingValue
          label="Avg. Buy Price"
          value={`₹${investment.averageBuyPrice.toLocaleString(
            "en-IN"
          )}`}
        />

        <HoldingValue
          label="Current Price"
          value={`₹${investment.currentPrice.toLocaleString(
            "en-IN"
          )}`}
        />

        <HoldingValue
          label="Invested"
          value={`₹${investment.investedValue.toLocaleString(
            "en-IN"
          )}`}
        />

        <HoldingValue
          label="Current Value"
          value={`₹${investment.currentValue.toLocaleString(
            "en-IN"
          )}`}
        />
      </div>

      <div
        style={{
          ...performanceBoxStyle,
          background: positive
            ? theme.colors.successSoft
            : theme.colors.dangerSoft,
        }}
      >
        <div>
          <p style={performanceLabelStyle}>Profit / Loss</p>

          <strong
            style={{
              ...performanceValueStyle,
              color: positive
                ? theme.colors.success
                : theme.colors.danger,
            }}
          >
            {positive ? "+" : "-"}₹
            {Math.abs(investment.profitLoss).toLocaleString(
              "en-IN"
            )}
          </strong>
        </div>

        <div style={returnBoxStyle}>
          {positive ? (
            <ArrowUpRight size={18} />
          ) : (
            <ArrowDownRight size={18} />
          )}

          <strong>
            {investment.returnPercentage >= 0 ? "+" : ""}
            {investment.returnPercentage.toFixed(2)}%
          </strong>
        </div>
      </div>
    </div>
  );
}

function HoldingValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p style={holdingLabelStyle}>{label}</p>
      <strong style={holdingValueStyle}>{value}</strong>
    </div>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(200px, 1fr))",
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
  fontSize: "24px",
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

const formTwoColumnStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(140px, 1fr))",
  gap: "12px",
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
  fontSize: "18px",
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

const holdingsHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  marginBottom: "8px",
  flexWrap: "wrap" as const,
};

const portfolioBadgeStyle = {
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

const holdingCardStyle = {
  padding: "22px 0",
};

const holdingHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "18px",
  flexWrap: "wrap" as const,
};

const holdingIdentityStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  minWidth: 0,
};

const assetIconStyle = {
  width: "44px",
  height: "44px",
  flexShrink: 0,
  borderRadius: "13px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: theme.colors.primarySoft,
  color: theme.colors.primary,
};

const nameRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap" as const,
};

const holdingNameStyle = {
  margin: 0,
  color: theme.colors.text,
  fontSize: "15px",
};

const assetBadgeStyle = {
  padding: "4px 8px",
  borderRadius: theme.radius.pill,
  background: theme.colors.surfaceSoft,
  color: theme.colors.textSecondary,
  fontSize: "9px",
  fontWeight: 700,
};

const symbolRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginTop: "6px",
  flexWrap: "wrap" as const,
};

const symbolStyle = {
  color: theme.colors.primary,
  fontSize: "11px",
  fontWeight: 800,
};

const dateStyle = {
  display: "flex",
  alignItems: "center",
  gap: "4px",
  color: theme.colors.textMuted,
  fontSize: "10px",
};

const actionGroupStyle = {
  display: "flex",
  gap: "7px",
  flexWrap: "wrap" as const,
};

const refreshButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "8px 11px",
  border: "none",
  borderRadius: "9px",
  background: theme.colors.successSoft,
  color: theme.colors.success,
  cursor: "pointer",
  fontSize: "11px",
  fontWeight: 700,
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

const holdingStatsStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(110px, 1fr))",
  gap: "18px",
  marginTop: "22px",
  padding: "18px",
  borderRadius: theme.radius.medium,
  background: theme.colors.surfaceSoft,
};

const holdingLabelStyle = {
  margin: "0 0 6px",
  color: theme.colors.textMuted,
  fontSize: "10px",
};

const holdingValueStyle = {
  color: theme.colors.text,
  fontSize: "13px",
};

const performanceBoxStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "15px",
  marginTop: "12px",
  padding: "13px 15px",
  borderRadius: theme.radius.medium,
};

const performanceLabelStyle = {
  margin: "0 0 4px",
  color: theme.colors.textSecondary,
  fontSize: "10px",
};

const performanceValueStyle = {
  fontSize: "15px",
};

const returnBoxStyle = {
  display: "flex",
  alignItems: "center",
  gap: "5px",
  color: "inherit",
  fontSize: "13px",
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

export default Investments;