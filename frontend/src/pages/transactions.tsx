import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Pencil,
  Plus,
  ReceiptText,
  Search,
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

type Transaction = {
  _id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  paymentMethod: string;
  date: string;
};

type TransactionsProps = {
  onLogout: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
};

type FilterType = "all" | "income" | "expense";

function Transactions({
  onLogout,
  activePage,
  setActivePage,
}: TransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [type, setType] =
    useState<"income" | "expense">("expense");

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<FilterType>("all");

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onLogout();
  };

  const totalIncome = transactions
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + item.amount, 0);

  const totalExpense = transactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + item.amount, 0);

  const filteredTransactions = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesFilter =
        filter === "all" || transaction.type === filter;

      const matchesSearch =
        !searchText ||
        transaction.category
          .toLowerCase()
          .includes(searchText) ||
        transaction.description
          ?.toLowerCase()
          .includes(searchText) ||
        transaction.paymentMethod
          .toLowerCase()
          .includes(searchText);

      return matchesFilter && matchesSearch;
    });
  }, [transactions, search, filter]);

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
              MONEY ACTIVITY
            </p>

            <h1 style={layoutStyles.pageTitle}>
              Transactions
            </h1>

            <p style={layoutStyles.pageSubtitle}>
              Record, search, and manage your income and expenses.
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
            title="Total Transactions"
            value={transactions.length.toString()}
            subtitle="All recorded activity"
            icon={<ReceiptText size={20} />}
            color={theme.colors.primary}
            background={theme.colors.primarySoft}
          />

          <SummaryCard
            title="Total Income"
            value={`₹${totalIncome.toLocaleString("en-IN")}`}
            subtitle="Money received"
            icon={<ArrowUpRight size={20} />}
            color={theme.colors.success}
            background={theme.colors.successSoft}
          />

          <SummaryCard
            title="Total Expenses"
            value={`₹${totalExpense.toLocaleString("en-IN")}`}
            subtitle="Money spent"
            icon={<ArrowDownRight size={20} />}
            color={theme.colors.danger}
            background={theme.colors.dangerSoft}
          />
        </section>

        <section style={contentGridStyle}>
          <div style={cardStyles.paddedCard}>
            <div style={formHeaderStyle}>
              <div>
                <p style={sectionEyebrowStyle}>
                  {editingId ? "UPDATE" : "QUICK ADD"}
                </p>

                <h2 style={textStyles.sectionTitle}>
                  {editingId
                    ? "Edit Transaction"
                    : "New Transaction"}
                </h2>

                <p style={descriptionStyle}>
                  {editingId
                    ? "Update the selected record."
                    : "Add income or an expense."}
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

              <div style={amountWrapperStyle}>
                <span style={currencyStyle}>₹</span>

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

              <label style={textStyles.label}>
                Category
              </label>

              <input
                type="text"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                placeholder="Food, Salary, Shopping..."
                required
                style={inputStyles.input}
              />

              <label style={textStyles.label}>
                Description
              </label>

              <input
                type="text"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Optional description"
                style={inputStyles.input}
              />

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

              <button
                type="submit"
                style={{
                  ...buttonStyles.primary,
                  width: "100%",
                }}
              >
                {editingId
                  ? "Update Transaction"
                  : "Add Transaction"}
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
            <div style={listHeaderStyle}>
              <div>
                <p style={sectionEyebrowStyle}>
                  HISTORY
                </p>

                <h2 style={textStyles.sectionTitle}>
                  All Transactions
                </h2>

                <p style={descriptionStyle}>
                  {filteredTransactions.length} result
                  {filteredTransactions.length === 1
                    ? ""
                    : "s"}
                </p>
              </div>
            </div>

            <div style={toolsRowStyle}>
              <div style={searchWrapperStyle}>
                <Search
                  size={17}
                  style={searchIconStyle}
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search transactions..."
                  style={searchInputStyle}
                />
              </div>

              <div style={filterGroupStyle}>
                {(
                  [
                    ["all", "All"],
                    ["income", "Income"],
                    ["expense", "Expenses"],
                  ] as [FilterType, string][]
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    style={{
                      ...filterButtonStyle,
                      ...(filter === value
                        ? activeFilterStyle
                        : {}),
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {filteredTransactions.length === 0 ? (
              <div style={emptyStateStyle}>
                <div style={emptyIconStyle}>
                  <ReceiptText size={25} />
                </div>

                <h3 style={emptyTitleStyle}>
                  No transactions found
                </h3>

                <p style={emptyTextStyle}>
                  Try another search or add a new transaction.
                </p>
              </div>
            ) : (
              <div>
                {filteredTransactions.map(
                  (transaction, index) => (
                    <div
                      key={transaction._id}
                      style={{
                        ...transactionRowStyle,
                        borderBottom:
                          index ===
                          filteredTransactions.length - 1
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
                          {transaction.type === "income" ? (
                            <ArrowUpRight size={19} />
                          ) : (
                            <CreditCard size={19} />
                          )}
                        </div>

                        <div>
                          <div style={titleRowStyle}>
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

                          <span style={dateStyle}>
                            {formatDate(transaction.date)}
                          </span>
                        </div>
                      </div>

                      <div style={transactionRightStyle}>
                        <strong
                          style={{
                            ...amountStyle,
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

                        <div style={actionsStyle}>
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(transaction)
                            }
                            title="Edit"
                            style={editButtonStyle}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(transaction._id)
                            }
                            title="Delete"
                            style={deleteButtonStyle}
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

      <h2 style={summaryValueStyle}>{value}</h2>

      <p style={summarySubtitleStyle}>
        {subtitle}
      </p>
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

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(180px, 1fr))",
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
  gridTemplateColumns: "minmax(300px, 0.75fr) minmax(520px, 1.7fr)",
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

const listHeaderStyle = {
  marginBottom: "18px",
};

const toolsRowStyle = {
  display: "flex",
  gap: "12px",
  marginBottom: "10px",
  flexWrap: "wrap" as const,
};

const searchWrapperStyle = {
  position: "relative" as const,
  flex: 1,
  minWidth: "220px",
};

const searchIconStyle = {
  position: "absolute" as const,
  left: "13px",
  top: "50%",
  transform: "translateY(-50%)",
  color: theme.colors.textMuted,
};

const searchInputStyle = {
  width: "100%",
  padding: "10px 12px 10px 40px",
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.medium,
  background: theme.colors.surface,
  color: theme.colors.text,
  outline: "none",
  boxSizing: "border-box" as const,
};

const filterGroupStyle = {
  display: "flex",
  gap: "5px",
  padding: "4px",
  background: theme.colors.surfaceSoft,
  borderRadius: theme.radius.medium,
};

const filterButtonStyle = {
  padding: "8px 11px",
  border: "none",
  borderRadius: "8px",
  background: "transparent",
  color: theme.colors.textSecondary,
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: 650,
};

const activeFilterStyle = {
  background: theme.colors.surface,
  color: theme.colors.primary,
  boxShadow: theme.shadow.small,
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

const titleRowStyle = {
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

const dateStyle = {
  color: theme.colors.textMuted,
  fontSize: "10px",
};

const transactionRightStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
};

const amountStyle = {
  minWidth: "105px",
  textAlign: "right" as const,
  fontSize: "14px",
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

export default Transactions;