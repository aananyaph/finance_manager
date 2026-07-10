import { useEffect, useState } from "react";
import {
  ArrowRight,
  CreditCard,
  Pencil,
  Plus,
  ReceiptText,
  Trash2,
} from "lucide-react";

import api from "../services/api";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import FinanceChart from "../components/FinanceChart";

import {
  buttonStyles,
  cardStyles,
  inputStyles,
  layoutStyles,
  textStyles,
  theme,
} from "../styles/theme";

type Transaction = {
  _id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  paymentMethod: string;
  date: string;
};

type DashboardProps = {
  onLogout: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
};

function Dashboard({
  onLogout,
  activePage,
  setActivePage,
}: DashboardProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(
    []
  );

  const [type, setType] = useState<"income" | "expense">(
    "expense"
  );

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [message, setMessage] = useState("");

  const [editingId, setEditingId] = useState<string | null>(
    null
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onLogout();
  };

  const fetchTransactions = async () => {
    try {
      const response = await api.get("/api/transactions");
      setTransactions(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Could not load transactions");
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setType("expense");
    setAmount("");
    setCategory("");
    setDescription("");
    setPaymentMethod("UPI");
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const transactionData = {
      type,
      amount: Number(amount),
      category,
      description,
      paymentMethod,
    };

    try {
      if (editingId) {
        await api.put(
          `/api/transactions/${editingId}`,
          transactionData
        );

        setMessage("Transaction updated successfully!");
      } else {
        await api.post(
          "/api/transactions",
          transactionData
        );

        setMessage("Transaction added successfully!");
      }

      resetForm();
      await fetchTransactions();
    } catch (error) {
      console.error(error);

      setMessage(
        editingId
          ? "Could not update transaction"
          : "Could not add transaction"
      );
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction._id);
    setType(transaction.type);
    setAmount(transaction.amount.toString());
    setCategory(transaction.category);
    setDescription(transaction.description || "");
    setPaymentMethod(transaction.paymentMethod);
    setMessage("Editing transaction...");

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
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/api/transactions/${id}`);

      if (editingId === id) {
        resetForm();
      }

      setMessage("Transaction deleted successfully!");
      await fetchTransactions();
    } catch (error) {
      console.error(error);
      setMessage("Could not delete transaction");
    }
  };

  const totalIncome = transactions
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + item.amount, 0);

  const totalExpense = transactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + item.amount, 0);

  const balance = totalIncome - totalExpense;

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div style={layoutStyles.page}>
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main style={layoutStyles.main}>
        {/* Header */}
        <header style={layoutStyles.pageHeader}>
          <div>
            <p style={eyebrowStyle}>FINANCIAL OVERVIEW</p>

            <h1 style={layoutStyles.pageTitle}>
              Dashboard
            </h1>

            <p style={layoutStyles.pageSubtitle}>
              Track your money and stay in control of your
              financial progress.
            </p>
          </div>

          <div style={headerActionsStyle}>
            <button
              type="button"
              onClick={() =>
                setActivePage("Transactions")
              }
              style={buttonStyles.secondary}
            >
              <ReceiptText size={17} />
              View Transactions
            </button>

            <button
              type="button"
              onClick={handleLogout}
              style={buttonStyles.danger}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Summary Cards */}
        <section style={statsGridStyle}>
          <StatCard
            title="Current Balance"
            value={balance}
            icon="💳"
          />

          <StatCard
            title="Total Income"
            value={totalIncome}
            icon="📈"
          />

          <StatCard
            title="Total Expenses"
            value={totalExpense}
            icon="📉"
          />
        </section>

        {/* Chart and Quick Add */}
        <section style={overviewGridStyle}>
          <FinanceChart
            income={totalIncome}
            expense={totalExpense}
          />

          <div style={cardStyles.paddedCard}>
            <div style={sectionHeadingRowStyle}>
              <div>
                <p style={sectionEyebrowStyle}>
                  QUICK ACTION
                </p>

                <h2 style={textStyles.sectionTitle}>
                  {editingId
                    ? "Edit Transaction"
                    : "Add Transaction"}
                </h2>

                <p style={sectionDescriptionStyle}>
                  {editingId
                    ? "Update the selected transaction."
                    : "Record income or an expense instantly."}
                </p>
              </div>

              <div style={quickActionIconStyle}>
                {editingId ? (
                  <Pencil size={19} />
                ) : (
                  <Plus size={20} />
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={typeToggleStyle}>
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  style={{
                    ...typeButtonStyle,
                    ...(type === "expense"
                      ? expenseActiveStyle
                      : {}),
                  }}
                >
                  Expense
                </button>

                <button
                  type="button"
                  onClick={() => setType("income")}
                  style={{
                    ...typeButtonStyle,
                    ...(type === "income"
                      ? incomeActiveStyle
                      : {}),
                  }}
                >
                  Income
                </button>
              </div>

              <label style={textStyles.label}>
                Amount
              </label>

              <div style={amountInputWrapperStyle}>
                <span style={currencySymbolStyle}>₹</span>

                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                  placeholder="0"
                  required
                  style={amountInputStyle}
                />
              </div>

              <div style={formGridStyle}>
                <div>
                  <label style={textStyles.label}>
                    Category
                  </label>

                  <input
                    type="text"
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value)
                    }
                    placeholder="Food, Salary..."
                    required
                    style={inputStyles.input}
                  />
                </div>

                <div>
                  <label style={textStyles.label}>
                    Payment Method
                  </label>

                  <select
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value)
                    }
                    style={inputStyles.select}
                  >
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">
                      Bank Transfer
                    </option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <label style={textStyles.label}>
                Description
              </label>

              <input
                type="text"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Add an optional note"
                style={inputStyles.input}
              />

              <button
                type="submit"
                style={{
                  ...buttonStyles.primary,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {editingId
                  ? "Update Transaction"
                  : "Add Transaction"}

                <ArrowRight size={17} />
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{
                    ...buttonStyles.secondary,
                    width: "100%",
                    marginTop: "10px",
                  }}
                >
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
        </section>

        {/* Recent Transactions */}
        <section
          style={{
            ...cardStyles.paddedCard,
            marginTop: "24px",
          }}
        >
          <div style={transactionsHeaderStyle}>
            <div>
              <p style={sectionEyebrowStyle}>
                ACTIVITY
              </p>

              <h2 style={textStyles.sectionTitle}>
                Recent Transactions
              </h2>

              <p style={sectionDescriptionStyle}>
                Your latest financial activity.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setActivePage("Transactions")
              }
              style={viewAllButtonStyle}
            >
              View all
              <ArrowRight size={16} />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div style={emptyStateStyle}>
              <div style={emptyIconStyle}>
                <ReceiptText size={25} />
              </div>

              <h3 style={emptyTitleStyle}>
                No transactions yet
              </h3>

              <p style={emptyTextStyle}>
                Add your first transaction to start tracking
                your finances.
              </p>
            </div>
          ) : (
            <div>
              {recentTransactions.map(
                (transaction, index) => (
                  <div
                    key={transaction._id}
                    style={{
                      ...transactionRowStyle,
                      borderBottom:
                        index ===
                        recentTransactions.length - 1
                          ? "none"
                          : `1px solid ${theme.colors.borderLight}`,
                    }}
                  >
                    <div style={transactionMainStyle}>
                      <div
                        style={{
                          ...transactionIconStyle,
                          background:
                            transaction.type === "income"
                              ? theme.colors.successSoft
                              : theme.colors.dangerSoft,
                          color:
                            transaction.type === "income"
                              ? theme.colors.success
                              : theme.colors.danger,
                        }}
                      >
                        <CreditCard size={19} />
                      </div>

                      <div>
                        <div style={transactionTitleRowStyle}>
                          <strong style={transactionTitleStyle}>
                            {transaction.category}
                          </strong>

                          <span style={paymentBadgeStyle}>
                            {transaction.paymentMethod}
                          </span>
                        </div>

                        <p style={transactionDescriptionStyle}>
                          {transaction.description ||
                            "No description"}
                        </p>

                        <span style={transactionDateStyle}>
                          {formatDate(transaction.date)}
                        </span>
                      </div>
                    </div>

                    <div style={transactionRightStyle}>
                      <strong
                        style={{
                          ...transactionAmountStyle,
                          color:
                            transaction.type === "income"
                              ? theme.colors.success
                              : theme.colors.danger,
                        }}
                      >
                        {transaction.type === "income"
                          ? "+"
                          : "-"}
                        ₹
                        {transaction.amount.toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                      <div style={rowActionsStyle}>
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(transaction)
                          }
                          title="Edit transaction"
                          style={iconButtonStyle}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(transaction._id)
                          }
                          title="Delete transaction"
                          style={{
                            ...iconButtonStyle,
                            color: theme.colors.danger,
                            background:
                              theme.colors.dangerSoft,
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </main>
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

const headerActionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap" as const,
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3, minmax(200px, 1fr))",
  gap: "18px",
  marginBottom: "24px",
};

const overviewGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "minmax(420px, 1.55fr) minmax(320px, 1fr)",
  gap: "24px",
  alignItems: "stretch",
};

const sectionHeadingRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  marginBottom: "20px",
};

const sectionEyebrowStyle = {
  margin: "0 0 7px",
  color: theme.colors.primary,
  fontSize: "9px",
  fontWeight: 800,
  letterSpacing: "1.3px",
};

const sectionDescriptionStyle = {
  margin: "7px 0 0",
  color: theme.colors.textMuted,
  fontSize: "12px",
};

const quickActionIconStyle = {
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

const typeToggleStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "6px",
  padding: "5px",
  marginBottom: "18px",
  background: theme.colors.surfaceSoft,
  borderRadius: theme.radius.medium,
};

const typeButtonStyle = {
  padding: "9px",
  border: "none",
  borderRadius: "9px",
  background: "transparent",
  color: theme.colors.textSecondary,
  cursor: "pointer",
  fontWeight: 650,
};

const expenseActiveStyle = {
  background: theme.colors.surface,
  color: theme.colors.danger,
  boxShadow: theme.shadow.small,
};

const incomeActiveStyle = {
  background: theme.colors.surface,
  color: theme.colors.success,
  boxShadow: theme.shadow.small,
};

const amountInputWrapperStyle = {
  position: "relative" as const,
  marginTop: "6px",
  marginBottom: "16px",
};

const currencySymbolStyle = {
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

const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
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

const transactionsHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  marginBottom: "8px",
};

const viewAllButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "8px 11px",
  border: "none",
  background: theme.colors.primarySoft,
  color: theme.colors.primary,
  borderRadius: theme.radius.small,
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: 700,
};

const transactionRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  padding: "17px 0",
};

const transactionMainStyle = {
  display: "flex",
  alignItems: "center",
  gap: "13px",
  minWidth: 0,
};

const transactionIconStyle = {
  width: "42px",
  height: "42px",
  flexShrink: 0,
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const transactionTitleRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap" as const,
};

const transactionTitleStyle = {
  color: theme.colors.text,
  fontSize: "14px",
};

const paymentBadgeStyle = {
  padding: "3px 7px",
  borderRadius: theme.radius.pill,
  background: theme.colors.surfaceSoft,
  color: theme.colors.textSecondary,
  fontSize: "9px",
  fontWeight: 700,
};

const transactionDescriptionStyle = {
  margin: "4px 0",
  color: theme.colors.textSecondary,
  fontSize: "12px",
};

const transactionDateStyle = {
  color: theme.colors.textMuted,
  fontSize: "10px",
};

const transactionRightStyle = {
  display: "flex",
  alignItems: "center",
  gap: "18px",
};

const transactionAmountStyle = {
  minWidth: "110px",
  textAlign: "right" as const,
  fontSize: "14px",
};

const rowActionsStyle = {
  display: "flex",
  gap: "7px",
};

const iconButtonStyle = {
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

const emptyStateStyle = {
  padding: "50px 20px",
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

export default Dashboard;