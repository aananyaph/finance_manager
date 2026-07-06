import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

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

  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const fetchBudgets = async () => {
    try {
      const response = await api.get(
        `/api/budgets?month=${month}&year=${year}`
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
          `/api/budgets/${editingId}`,
          budgetData
        );

        setMessage("Budget updated successfully!");
      } else {
        await api.post("/api/budgets", budgetData);

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
  };

  const handleCancelEdit = () => {
    resetForm();
    setMessage("Edit cancelled");
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/api/budgets/${id}`);

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
            <h1 style={{ margin: 0 }}>
              Budget Management
            </h1>

            <p style={{ color: "#6b7280" }}>
              Set monthly limits and track your spending.
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={logoutButtonStyle}
          >
            Logout
          </button>
        </div>

        {/* Month and Year Filter */}
        <section
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "14px",
            marginBottom: "24px",
          }}
        >
          <h3>Select Budget Period</h3>

          <div
            style={{
              display: "flex",
              gap: "16px",
            }}
          >
            <select
              value={month}
              onChange={(e) => {
                setMonth(Number(e.target.value));
                resetForm();
              }}
              style={inputStyle}
            >
              {[
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
              ].map((name, index) => (
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
              onChange={(e) => {
                setYear(Number(e.target.value));
                resetForm();
              }}
              style={inputStyle}
            />
          </div>
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(280px, 1fr) minmax(450px, 2fr)",
            gap: "24px",
          }}
        >
          {/* Create / Edit Budget */}
          <section style={cardStyle}>
            <h2>
              {editingId
                ? "Edit Budget"
                : "Create Budget"}
            </h2>

            <form onSubmit={handleSubmit}>
              <label>Category</label>

              <input
                type="text"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                placeholder="Food, Shopping, Travel..."
                required
                style={inputStyle}
              />

              <label>Monthly Limit</label>

              <input
                type="number"
                min="1"
                value={limit}
                onChange={(e) =>
                  setLimit(e.target.value)
                }
                placeholder="5000"
                required
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
                  ? "Update Budget"
                  : "Create Budget"}
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

          {/* Budget Cards */}
          <section>
            <h2 style={{ marginTop: 0 }}>
              Monthly Budgets
            </h2>

            {budgets.length === 0 ? (
              <div style={cardStyle}>
                No budgets created for this month.
              </div>
            ) : (
              budgets.map((budget) => {
                const displayPercentage = Math.min(
                  budget.percentage,
                  100
                );

                const progressColor =
                  budget.status === "exceeded"
                    ? "#dc2626"
                    : budget.status === "warning"
                      ? "#f59e0b"
                      : "#16a34a";

                return (
                  <div
                    key={budget._id}
                    style={{
                      ...cardStyle,
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "16px",
                      }}
                    >
                      <h3 style={{ margin: 0 }}>
                        {budget.category}
                      </h3>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <strong
                          style={{
                            color: progressColor,
                          }}
                        >
                          {budget.percentage}%
                        </strong>

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(budget)
                          }
                          style={editButtonStyle}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(budget._id)
                          }
                          style={deleteButtonStyle}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <p>
                      ₹
                      {budget.spent.toLocaleString(
                        "en-IN"
                      )}{" "}
                      spent of ₹
                      {budget.limit.toLocaleString(
                        "en-IN"
                      )}
                    </p>

                    <div
                      style={{
                        width: "100%",
                        height: "12px",
                        background: "#e5e7eb",
                        borderRadius: "10px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${displayPercentage}%`,
                          height: "100%",
                          background: progressColor,
                        }}
                      />
                    </div>

                    <p
                      style={{
                        marginBottom: 0,
                        color:
                          budget.remaining < 0
                            ? "#dc2626"
                            : "#6b7280",
                      }}
                    >
                      {budget.remaining >= 0
                        ? "Remaining"
                        : "Over budget"}
                      : ₹
                      {Math.abs(
                        budget.remaining
                      ).toLocaleString("en-IN")}
                    </p>

                    {budget.status === "warning" && (
                      <p
                        style={{
                          color: "#d97706",
                          fontWeight: "bold",
                        }}
                      >
                        ⚠ You have used over 80% of this
                        budget.
                      </p>
                    )}

                    {budget.status === "exceeded" && (
                      <p
                        style={{
                          color: "#dc2626",
                          fontWeight: "bold",
                        }}
                      >
                        🚨 Budget exceeded!
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

const cardStyle = {
  background: "white",
  padding: "24px",
  borderRadius: "14px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
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
  width: "100%",
  padding: "12px",
  marginTop: "10px",
  background: "#e5e7eb",
  color: "#111827",
  border: "none",
  borderRadius: "8px",
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

export default Budgets;