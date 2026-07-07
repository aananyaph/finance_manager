import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

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
  const [investments, setInvestments] = useState<Investment[]>([]);

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

  const [editingId, setEditingId] = useState<string | null>(null);
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
    await Promise.all([
      fetchInvestments(),
      fetchSummary(),
    ]);
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
        await api.post(
          "/api/investments",
          investmentData
        );

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

    setCurrentPrice(
      investment.currentPrice.toString()
    );

    setPurchaseDate(
      investment.purchaseDate
        ? investment.purchaseDate.split("T")[0]
        : ""
    );

    setMessage("Editing investment...");
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
      setMessage("Fetching live market price...");

      await api.put(
        `/api/investments/${id}/refresh-price`
      );

      setMessage("Live price updated successfully!");
      await refreshPortfolio();
    } catch (error: any) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Could not refresh live price"
      );
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

      <main
        style={{
          flex: 1,
          padding: "32px",
        }}
      >
        <div style={headerStyle}>
          <div>
            <h1 style={{ margin: 0 }}>
              Investment Portfolio
            </h1>

            <p style={{ color: "#6b7280" }}>
              Track your holdings, returns, and portfolio
              performance.
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={logoutButtonStyle}
          >
            Logout
          </button>
        </div>

        {/* Portfolio Summary */}
        <div style={summaryGridStyle}>
          <SummaryCard
            title="Total Invested"
            value={`₹${summary.totalInvested.toLocaleString(
              "en-IN"
            )}`}
          />

          <SummaryCard
            title="Current Value"
            value={`₹${summary.totalCurrentValue.toLocaleString(
              "en-IN"
            )}`}
          />

          <SummaryCard
            title="Profit / Loss"
            value={`${
              summary.totalProfitLoss >= 0 ? "+" : "-"
            }₹${Math.abs(
              summary.totalProfitLoss
            ).toLocaleString("en-IN")}`}
            positive={summary.totalProfitLoss >= 0}
          />

          <SummaryCard
            title="Total Return"
            value={`${summary.totalReturnPercentage.toFixed(
              2
            )}%`}
            positive={
              summary.totalReturnPercentage >= 0
            }
          />

          <SummaryCard
            title="Holdings"
            value={summary.totalHoldings.toString()}
          />
        </div>

        <div style={contentGridStyle}>
          {/* Add / Edit Investment */}
          <section style={cardStyle}>
            <h2>
              {editingId
                ? "Edit Investment"
                : "Add Investment"}
            </h2>

            <form onSubmit={handleSubmit}>
              <label>Asset Type</label>

              <select
                value={assetType}
                onChange={(e) =>
                  setAssetType(e.target.value)
                }
                style={inputStyle}
              >
                <option value="Stock">Stock</option>

                <option value="Mutual Fund">
                  Mutual Fund
                </option>

                <option value="ETF">ETF</option>

                <option value="Crypto">
                  Crypto
                </option>

                <option value="Fixed Deposit">
                  Fixed Deposit
                </option>

                <option value="Other">
                  Other
                </option>
              </select>

              <label>Investment Name</label>

              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Reliance Industries"
                required
                style={inputStyle}
              />

              <label>Symbol</label>

              <input
                value={symbol}
                onChange={(e) =>
                  setSymbol(
                    e.target.value.toUpperCase()
                  )
                }
                placeholder="RELIANCE"
                style={inputStyle}
              />

              <label>Quantity</label>

              <input
                type="number"
                min="0"
                step="any"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
                required
                style={inputStyle}
              />

              <label>Average Buy Price</label>

              <input
                type="number"
                min="0"
                step="any"
                value={averageBuyPrice}
                onChange={(e) =>
                  setAverageBuyPrice(e.target.value)
                }
                required
                style={inputStyle}
              />

              <label>Current Price</label>

              <input
                type="number"
                min="0"
                step="any"
                value={currentPrice}
                onChange={(e) =>
                  setCurrentPrice(e.target.value)
                }
                required
                style={inputStyle}
              />

              <label>Purchase Date</label>

              <input
                type="date"
                value={purchaseDate}
                onChange={(e) =>
                  setPurchaseDate(e.target.value)
                }
                style={inputStyle}
              />

              <button
                type="submit"
                style={{
                  ...mainButtonStyle,
                  background: editingId
                    ? "#2563eb"
                    : "#111827",
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
                  style={cancelButtonStyle}
                >
                  Cancel Edit
                </button>
              )}
            </form>

            {message && (
              <p style={{ marginTop: "16px" }}>
                {message}
              </p>
            )}
          </section>

          {/* Holdings */}
          <section>
            <h2 style={{ marginTop: 0 }}>
              Your Holdings
            </h2>

            {investments.length === 0 ? (
              <div style={cardStyle}>
                No investments added yet.
              </div>
            ) : (
              investments.map((investment) => (
                <div
                  key={investment._id}
                  style={{
                    ...cardStyle,
                    marginBottom: "16px",
                  }}
                >
                  <div style={holdingHeaderStyle}>
                    <div>
                      <h3 style={{ margin: 0 }}>
                        {investment.name}
                      </h3>

                      <p
                        style={{
                          margin: "6px 0",
                          color: "#6b7280",
                        }}
                      >
                        {investment.assetType}

                        {investment.symbol
                          ? ` • ${investment.symbol}`
                          : ""}
                      </p>
                    </div>

                    <div style={buttonGroupStyle}>
                      {investment.assetType ===
                        "Stock" &&
                        investment.symbol && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRefreshPrice(
                                investment._id
                              )
                            }
                            style={refreshButtonStyle}
                          >
                            Refresh Live Price
                          </button>
                        )}

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(investment)
                        }
                        style={editButtonStyle}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            investment._id
                          )
                        }
                        style={deleteButtonStyle}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div style={holdingStatsStyle}>
                    <HoldingValue
                      label="Quantity"
                      value={investment.quantity.toString()}
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

                    <HoldingValue
                      label="Profit / Loss"
                      value={`${
                        investment.profitLoss >= 0
                          ? "+"
                          : "-"
                      }₹${Math.abs(
                        investment.profitLoss
                      ).toLocaleString("en-IN")}`}
                      positive={
                        investment.profitLoss >= 0
                      }
                    />

                    <HoldingValue
                      label="Return"
                      value={`${investment.returnPercentage.toFixed(
                        2
                      )}%`}
                      positive={
                        investment.returnPercentage >=
                        0
                      }
                    />
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

type ValueProps = {
  title: string;
  value: string;
  positive?: boolean;
};

function SummaryCard({
  title,
  value,
  positive,
}: ValueProps) {
  return (
    <div style={summaryCardStyle}>
      <p
        style={{
          margin: 0,
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        {title}
      </p>

      <h3
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
      </h3>
    </div>
  );
}

type HoldingValueProps = {
  label: string;
  value: string;
  positive?: boolean;
};

function HoldingValue({
  label,
  value,
  positive,
}: HoldingValueProps) {
  return (
    <div>
      <small
        style={{
          color: "#6b7280",
        }}
      >
        {label}
      </small>

      <p
        style={{
          margin: "5px 0 0",
          fontWeight: "bold",
          color:
            positive === undefined
              ? "#111827"
              : positive
                ? "#16a34a"
                : "#dc2626",
        }}
      >
        {value}
      </p>
    </div>
  );
}

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "30px",
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

const contentGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "minmax(300px, 1fr) minmax(500px, 2fr)",
  gap: "24px",
};

const cardStyle = {
  background: "white",
  padding: "24px",
  borderRadius: "14px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
};

const holdingHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
};

const holdingStatsStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(110px, 1fr))",
  gap: "16px",
  marginTop: "20px",
};

const buttonGroupStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap" as const,
};

const inputStyle = {
  width: "100%",
  padding: "11px",
  marginTop: "6px",
  marginBottom: "16px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  boxSizing: "border-box" as const,
};

const mainButtonStyle = {
  width: "100%",
  padding: "12px",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

const cancelButtonStyle = {
  ...mainButtonStyle,
  marginTop: "10px",
  background: "#e5e7eb",
  color: "#111827",
};

const refreshButtonStyle = {
  padding: "7px 12px",
  background: "#dcfce7",
  color: "#15803d",
  border: "none",
  borderRadius: "7px",
  cursor: "pointer",
  fontWeight: "bold",
};

const editButtonStyle = {
  padding: "7px 12px",
  background: "#dbeafe",
  color: "#2563eb",
  border: "none",
  borderRadius: "7px",
  cursor: "pointer",
  fontWeight: "bold",
};

const deleteButtonStyle = {
  padding: "7px 12px",
  background: "#fee2e2",
  color: "#dc2626",
  border: "none",
  borderRadius: "7px",
  cursor: "pointer",
  fontWeight: "bold",
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

export default Investments;