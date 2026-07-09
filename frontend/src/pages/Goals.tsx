import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

type Goal = {
  _id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
  category: string;
  status: "Active" | "Completed";
  progress: number;
  remaining: number;
  daysLeft: number;
};

type GoalsProps = {
  onLogout: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
};

function Goals({
  onLogout,
  activePage,
  setActivePage,
}: GoalsProps) {
  const [goals, setGoals] = useState<Goal[]>([]);

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState("Other");

  const [editingId, setEditingId] = useState<string | null>(
    null
  );

  const [contributionGoalId, setContributionGoalId] =
    useState<string | null>(null);

  const [contributionAmount, setContributionAmount] =
    useState("");

  const [message, setMessage] = useState("");

  const fetchGoals = async () => {
    try {
      const response = await api.get("/api/goals");
      setGoals(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Could not load goals");
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setTargetAmount("");
    setSavedAmount("");
    setDeadline("");
    setCategory("Other");
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const goalData = {
      name,
      targetAmount: Number(targetAmount),
      savedAmount: Number(savedAmount || 0),
      deadline,
      category,
    };

    try {
      if (editingId) {
        await api.put(`/api/goals/${editingId}`, goalData);
        setMessage("Goal updated successfully!");
      } else {
        await api.post("/api/goals", goalData);
        setMessage("Goal created successfully!");
      }

      resetForm();
      await fetchGoals();
    } catch (error: any) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Could not save goal"
      );
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingId(goal._id);
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setSavedAmount(goal.savedAmount.toString());
    setDeadline(goal.deadline.split("T")[0]);
    setCategory(goal.category);
    setMessage("Editing goal...");
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this goal?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/api/goals/${id}`);

      if (editingId === id) {
        resetForm();
      }

      setMessage("Goal deleted successfully!");
      await fetchGoals();
    } catch (error) {
      console.error(error);
      setMessage("Could not delete goal");
    }
  };

  const handleContribution = async (id: string) => {
    const amount = Number(contributionAmount);

    if (!amount || amount <= 0) {
      setMessage("Enter a valid contribution amount");
      return;
    }

    try {
      await api.put(`/api/goals/${id}/contribute`, {
        amount,
      });

      setContributionAmount("");
      setContributionGoalId(null);
      setMessage("Contribution added successfully!");

      await fetchGoals();
    } catch (error: any) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Could not add contribution"
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

  const totalTarget = goals.reduce(
    (total, goal) => total + goal.targetAmount,
    0
  );

  const totalSaved = goals.reduce(
    (total, goal) => total + goal.savedAmount,
    0
  );

  const completedGoals = goals.filter(
    (goal) => goal.status === "Completed"
  ).length;

  return (
    <div style={pageStyle}>
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main style={mainStyle}>
        <div style={headerStyle}>
          <div>
            <h1 style={{ margin: 0 }}>Financial Goals</h1>

            <p style={{ color: "#6b7280" }}>
              Plan your goals and track your savings progress.
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={logoutButtonStyle}
          >
            Logout
          </button>
        </div>

        <div style={summaryGridStyle}>
          <SummaryCard
            title="Total Goals"
            value={goals.length.toString()}
          />

          <SummaryCard
            title="Total Target"
            value={`₹${totalTarget.toLocaleString("en-IN")}`}
          />

          <SummaryCard
            title="Total Saved"
            value={`₹${totalSaved.toLocaleString("en-IN")}`}
          />

          <SummaryCard
            title="Completed"
            value={completedGoals.toString()}
          />
        </div>

        <div style={contentGridStyle}>
          <section style={cardStyle}>
            <h2>
              {editingId ? "Edit Goal" : "Create Goal"}
            </h2>

            <form onSubmit={handleSubmit}>
              <label>Goal Name</label>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Buy a Laptop"
                required
                style={inputStyle}
              />

              <label>Target Amount</label>

              <input
                type="number"
                min="1"
                value={targetAmount}
                onChange={(e) =>
                  setTargetAmount(e.target.value)
                }
                placeholder="80000"
                required
                style={inputStyle}
              />

              <label>Already Saved</label>

              <input
                type="number"
                min="0"
                value={savedAmount}
                onChange={(e) =>
                  setSavedAmount(e.target.value)
                }
                placeholder="25000"
                style={inputStyle}
              />

              <label>Deadline</label>

              <input
                type="date"
                value={deadline}
                onChange={(e) =>
                  setDeadline(e.target.value)
                }
                required
                style={inputStyle}
              />

              <label>Category</label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                style={inputStyle}
              >
                <option>Emergency Fund</option>
                <option>Travel</option>
                <option>Education</option>
                <option>Vehicle</option>
                <option>Home</option>
                <option>Electronics</option>
                <option>Investment</option>
                <option>Other</option>
              </select>

              <button
                type="submit"
                style={{
                  ...mainButtonStyle,
                  background: editingId
                    ? "#2563eb"
                    : "#111827",
                }}
              >
                {editingId ? "Update Goal" : "Create Goal"}
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
              <p style={{ marginTop: "16px" }}>{message}</p>
            )}
          </section>

          <section>
            <h2 style={{ marginTop: 0 }}>Your Goals</h2>

            {goals.length === 0 ? (
              <div style={cardStyle}>
                No financial goals created yet.
              </div>
            ) : (
              goals.map((goal) => (
                <div
                  key={goal._id}
                  style={{
                    ...cardStyle,
                    marginBottom: "18px",
                  }}
                >
                  <div style={goalHeaderStyle}>
                    <div>
                      <h3 style={{ margin: 0 }}>
                        {goal.name}
                      </h3>

                      <p style={categoryTextStyle}>
                        {goal.category} • {goal.status}
                      </p>
                    </div>

                    <div style={buttonGroupStyle}>
                      <button
                        onClick={() => handleEdit(goal)}
                        style={editButtonStyle}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(goal._id)
                        }
                        style={deleteButtonStyle}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div style={progressInfoStyle}>
                    <strong>
                      ₹{goal.savedAmount.toLocaleString("en-IN")}
                    </strong>

                    <span>
                      ₹{goal.targetAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div style={progressTrackStyle}>
                    <div
                      style={{
                        ...progressBarStyle,
                        width: `${goal.progress}%`,
                        background:
                          goal.status === "Completed"
                            ? "#16a34a"
                            : "#2563eb",
                      }}
                    />
                  </div>

                  <div style={goalStatsStyle}>
                    <GoalStat
                      label="Progress"
                      value={`${goal.progress.toFixed(2)}%`}
                    />

                    <GoalStat
                      label="Remaining"
                      value={`₹${goal.remaining.toLocaleString(
                        "en-IN"
                      )}`}
                    />

                    <GoalStat
                      label="Days Left"
                      value={
                        goal.daysLeft >= 0
                          ? goal.daysLeft.toString()
                          : "Overdue"
                      }
                    />
                  </div>

                  {goal.status !== "Completed" && (
                    <>
                      {contributionGoalId === goal._id ? (
                        <div style={contributionStyle}>
                          <input
                            type="number"
                            min="1"
                            value={contributionAmount}
                            onChange={(e) =>
                              setContributionAmount(
                                e.target.value
                              )
                            }
                            placeholder="Contribution amount"
                            style={contributionInputStyle}
                          />

                          <button
                            onClick={() =>
                              handleContribution(goal._id)
                            }
                            style={saveContributionButtonStyle}
                          >
                            Save
                          </button>

                          <button
                            onClick={() => {
                              setContributionGoalId(null);
                              setContributionAmount("");
                            }}
                            style={smallCancelButtonStyle}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            setContributionGoalId(goal._id)
                          }
                          style={contributeButtonStyle}
                        >
                          + Add Contribution
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div style={summaryCardStyle}>
      <p style={labelStyle}>{title}</p>
      <h2 style={{ marginBottom: 0 }}>{value}</h2>
    </div>
  );
}

function GoalStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <small style={{ color: "#6b7280" }}>{label}</small>
      <p style={{ margin: "5px 0 0", fontWeight: "bold" }}>
        {value}
      </p>
    </div>
  );
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
  marginBottom: "30px",
};

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "16px",
  marginBottom: "24px",
};

const summaryCardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "14px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
};

const labelStyle = {
  margin: 0,
  color: "#6b7280",
  fontSize: "14px",
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

const goalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
};

const categoryTextStyle = {
  color: "#6b7280",
  margin: "6px 0 0",
};

const buttonGroupStyle = {
  display: "flex",
  gap: "8px",
};

const progressInfoStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "22px",
  marginBottom: "8px",
};

const progressTrackStyle = {
  width: "100%",
  height: "12px",
  background: "#e5e7eb",
  borderRadius: "999px",
  overflow: "hidden",
};

const progressBarStyle = {
  height: "100%",
  borderRadius: "999px",
  transition: "width 0.3s ease",
};

const goalStatsStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "16px",
  marginTop: "20px",
};

const contributionStyle = {
  display: "flex",
  gap: "8px",
  marginTop: "20px",
};

const contributionInputStyle = {
  flex: 1,
  padding: "10px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
};

const contributeButtonStyle = {
  marginTop: "20px",
  padding: "10px 14px",
  background: "#dcfce7",
  color: "#15803d",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

const saveContributionButtonStyle = {
  padding: "10px 14px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const smallCancelButtonStyle = {
  padding: "10px 14px",
  background: "#e5e7eb",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
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

export default Goals;