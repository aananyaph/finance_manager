import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import FinanceChart from "../components/FinanceChart";

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
};

function Dashboard({ onLogout }: DashboardProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activePage, setActivePage] = useState("Dashboard");

  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [message, setMessage] = useState("");

  // Stores the ID of the transaction currently being edited
  const [editingId, setEditingId] = useState<string | null>(null);

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

  // Add or update transaction
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
        await api.post("/api/transactions", transactionData);

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

  // Load selected transaction into the form
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

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setType("expense");
    setAmount("");
    setCategory("");
    setDescription("");
    setPaymentMethod("UPI");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    resetForm();
    setMessage("Edit cancelled");
  };

  // Delete transaction
  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/api/transactions/${id}`);

      // If the deleted transaction was being edited, reset the form
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
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <div>
            <h1 style={{ margin: 0 }}>Dashboard</h1>

            <p style={{ color: "#6b7280" }}>
              Welcome back! Here's your financial overview.
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: "10px 20px",
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Logout
          </button>
        </div>

        {/* Statistics Cards */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "32px",
          }}
        >
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
        </div>

        {/* Finance Chart */}
        <div style={{ marginBottom: "32px" }}>
          <FinanceChart
            income={totalIncome}
            expense={totalExpense}
          />
        </div>

        {/* Main Content */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(300px, 1fr) minmax(400px, 2fr)",
            gap: "24px",
          }}
        >
          {/* Add / Edit Transaction */}
          <section
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "14px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
            }}
          >
            <h2>
              {editingId
                ? "Edit Transaction"
                : "Add Transaction"}
            </h2>

            <form onSubmit={handleSubmit}>
              <label>Type</label>

              <select
                value={type}
                onChange={(e) =>
                  setType(
                    e.target.value as "income" | "expense"
                  )
                }
                style={inputStyle}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>

              <label>Amount</label>

              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                style={inputStyle}
              />

              <label>Category</label>

              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Food, Salary, Shopping..."
                required
                style={inputStyle}
              />

              <label>Description</label>

              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                style={inputStyle}
              />

              <label>Payment Method</label>

              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
                style={inputStyle}
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
                  width: "100%",
                  padding: "12px",
                  background: editingId
                    ? "#2563eb"
                    : "#080a0e",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
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
                    width: "100%",
                    padding: "12px",
                    marginTop: "10px",
                    background: "#e5e7eb",
                    color: "#111827",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
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

          {/* Recent Transactions */}
          <section
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "14px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
            }}
          >
            <h2>Recent Transactions</h2>

            {transactions.length === 0 ? (
              <p>No transactions yet.</p>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "20px",
                    padding: "16px 0",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <div>
                    <strong>
                      {transaction.category}
                    </strong>

                    <p
                      style={{
                        margin: "5px 0",
                        color: "#6b7280",
                      }}
                    >
                      {transaction.description ||
                        "No description"}
                    </p>

                    <small>
                      {transaction.paymentMethod}
                    </small>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <strong
                      style={{
                        marginRight: "6px",
                        color:
                          transaction.type === "income"
                            ? "#16a34a"
                            : "#dc2626",
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

                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(transaction)
                      }
                      style={{
                        padding: "7px 12px",
                        background: "#dbeafe",
                        color: "#2563eb",
                        border: "none",
                        borderRadius: "7px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(transaction._id)
                      }
                      style={{
                        padding: "7px 12px",
                        background: "#fee2e2",
                        color: "#dc2626",
                        border: "none",
                        borderRadius: "7px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Delete
                    </button>
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

const inputStyle = {
  width: "100%",
  padding: "11px",
  marginTop: "6px",
  marginBottom: "16px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  boxSizing: "border-box" as const,
};

export default Dashboard;