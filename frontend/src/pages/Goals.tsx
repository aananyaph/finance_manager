import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flag,
  Pencil,
  PiggyBank,
  Plus,
  Target,
  Trash2,
  Trophy,
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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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

      if (contributionGoalId === id) {
        setContributionGoalId(null);
        setContributionAmount("");
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

  const overallProgress =
    totalTarget > 0
      ? Math.min((totalSaved / totalTarget) * 100, 100)
      : 0;

  return (
    <div style={layoutStyles.page}>
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main style={layoutStyles.main}>
        <header style={layoutStyles.pageHeader}>
          <div>
            <p style={eyebrowStyle}>SAVINGS JOURNEY</p>

            <h1 style={layoutStyles.pageTitle}>
              Financial Goals
            </h1>

            <p style={layoutStyles.pageSubtitle}>
              Plan your goals and turn your savings into real
              milestones.
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
            title="Total Goals"
            value={goals.length.toString()}
            subtitle={`${goals.length - completedGoals} active`}
            icon={<Target size={20} />}
            color={theme.colors.primary}
            background={theme.colors.primarySoft}
          />

          <SummaryCard
            title="Total Target"
            value={`₹${totalTarget.toLocaleString("en-IN")}`}
            subtitle="Combined savings target"
            icon={<Flag size={20} />}
            color={theme.colors.info}
            background={theme.colors.infoSoft}
          />

          <SummaryCard
            title="Total Saved"
            value={`₹${totalSaved.toLocaleString("en-IN")}`}
            subtitle={`${overallProgress.toFixed(0)}% overall progress`}
            icon={<PiggyBank size={20} />}
            color={theme.colors.success}
            background={theme.colors.successSoft}
          />

          <SummaryCard
            title="Completed"
            value={completedGoals.toString()}
            subtitle="Goals successfully achieved"
            icon={<Trophy size={20} />}
            color={theme.colors.warning}
            background={theme.colors.warningSoft}
          />
        </section>

        <section style={contentGridStyle}>
          <div style={cardStyles.paddedCard}>
            <div style={formHeaderStyle}>
              <div>
                <p style={sectionEyebrowStyle}>
                  {editingId ? "UPDATE" : "NEW MILESTONE"}
                </p>

                <h2 style={textStyles.sectionTitle}>
                  {editingId ? "Edit Goal" : "Create Goal"}
                </h2>

                <p style={descriptionStyle}>
                  {editingId
                    ? "Update your savings target."
                    : "Create a target and start saving."}
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
                Goal Name
              </label>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Buy a Laptop"
                required
                style={inputStyles.input}
              />

              <label style={textStyles.label}>
                Target Amount
              </label>

              <div style={amountWrapperStyle}>
                <span style={currencyStyle}>₹</span>

                <input
                  type="number"
                  min="1"
                  value={targetAmount}
                  onChange={(e) =>
                    setTargetAmount(e.target.value)
                  }
                  placeholder="80000"
                  required
                  style={amountInputStyle}
                />
              </div>

              <label style={textStyles.label}>
                Already Saved
              </label>

              <div style={amountWrapperStyle}>
                <span style={currencyStyle}>₹</span>

                <input
                  type="number"
                  min="0"
                  value={savedAmount}
                  onChange={(e) =>
                    setSavedAmount(e.target.value)
                  }
                  placeholder="25000"
                  style={amountInputStyle}
                />
              </div>

              <div style={formTwoColumnStyle}>
                <div>
                  <label style={textStyles.label}>
                    Deadline
                  </label>

                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) =>
                      setDeadline(e.target.value)
                    }
                    required
                    style={inputStyles.input}
                  />
                </div>

                <div>
                  <label style={textStyles.label}>
                    Category
                  </label>

                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value)
                    }
                    style={inputStyles.select}
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
                </div>
              </div>

              <button
                type="submit"
                style={{
                  ...buttonStyles.primary,
                  width: "100%",
                }}
              >
                {editingId ? "Update Goal" : "Create Goal"}
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
            <div style={goalsHeaderStyle}>
              <div>
                <p style={sectionEyebrowStyle}>
                  YOUR MILESTONES
                </p>

                <h2 style={textStyles.sectionTitle}>
                  Savings Goals
                </h2>

                <p style={descriptionStyle}>
                  {goals.length} goal
                  {goals.length === 1 ? "" : "s"} being tracked
                </p>
              </div>

              <div style={overallBadgeStyle}>
                <Target size={15} />
                {overallProgress.toFixed(0)}% Overall
              </div>
            </div>

            {goals.length === 0 ? (
              <div style={emptyStateStyle}>
                <div style={emptyIconStyle}>
                  <Target size={25} />
                </div>

                <h3 style={emptyTitleStyle}>
                  No goals created yet
                </h3>

                <p style={emptyTextStyle}>
                  Create your first financial goal and start
                  tracking your progress.
                </p>
              </div>
            ) : (
              <div>
                {goals.map((goal, index) => (
                  <GoalCard
                    key={goal._id}
                    goal={goal}
                    isLast={index === goals.length - 1}
                    contributionOpen={
                      contributionGoalId === goal._id
                    }
                    contributionAmount={contributionAmount}
                    setContributionAmount={
                      setContributionAmount
                    }
                    onOpenContribution={(id) => {
                      setContributionGoalId(id);
                      setContributionAmount("");
                    }}
                    onCloseContribution={() => {
                      setContributionGoalId(null);
                      setContributionAmount("");
                    }}
                    onContribution={handleContribution}
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

      <h2 style={summaryValueStyle}>{value}</h2>

      <p style={summarySubtitleStyle}>{subtitle}</p>
    </div>
  );
}

function GoalCard({
  goal,
  isLast,
  contributionOpen,
  contributionAmount,
  setContributionAmount,
  onOpenContribution,
  onCloseContribution,
  onContribution,
  onEdit,
  onDelete,
}: {
  goal: Goal;
  isLast: boolean;
  contributionOpen: boolean;
  contributionAmount: string;
  setContributionAmount: (value: string) => void;
  onOpenContribution: (id: string) => void;
  onCloseContribution: () => void;
  onContribution: (id: string) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
}) {
  const completed = goal.status === "Completed";
  const overdue = goal.daysLeft < 0 && !completed;

  const progressColor = completed
    ? theme.colors.success
    : overdue
      ? theme.colors.danger
      : theme.colors.primary;

  const displayProgress = Math.min(
    Math.max(goal.progress, 0),
    100
  );

  return (
    <div
      style={{
        ...goalCardStyle,
        borderBottom: isLast
          ? "none"
          : `1px solid ${theme.colors.borderLight}`,
      }}
    >
      <div style={goalHeaderStyle}>
        <div style={goalIdentityStyle}>
          <div
            style={{
              ...goalIconStyle,
              background: completed
                ? theme.colors.successSoft
                : theme.colors.primarySoft,
              color: completed
                ? theme.colors.success
                : theme.colors.primary,
            }}
          >
            {completed ? (
              <CheckCircle2 size={20} />
            ) : (
              <Target size={20} />
            )}
          </div>

          <div>
            <div style={goalNameRowStyle}>
              <h3 style={goalNameStyle}>{goal.name}</h3>

              <span style={categoryBadgeStyle}>
                {goal.category}
              </span>

              <span
                style={{
                  ...statusBadgeStyle,
                  color: completed
                    ? theme.colors.success
                    : overdue
                      ? theme.colors.danger
                      : theme.colors.primary,
                  background: completed
                    ? theme.colors.successSoft
                    : overdue
                      ? theme.colors.dangerSoft
                      : theme.colors.primarySoft,
                }}
              >
                {completed
                  ? "Completed"
                  : overdue
                    ? "Overdue"
                    : "Active"}
              </span>
            </div>

            <div style={deadlineStyle}>
              <CalendarDays size={12} />
              Target date: {formatDate(goal.deadline)}
            </div>
          </div>
        </div>

        <div style={actionsStyle}>
          <button
            type="button"
            onClick={() => onEdit(goal)}
            title="Edit goal"
            style={editButtonStyle}
          >
            <Pencil size={16} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(goal._id)}
            title="Delete goal"
            style={deleteButtonStyle}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div style={moneyProgressStyle}>
        <div>
          <p style={moneyLabelStyle}>Saved</p>

          <strong style={savedAmountStyle}>
            ₹{goal.savedAmount.toLocaleString("en-IN")}
          </strong>
        </div>

        <div style={targetAmountBoxStyle}>
          <p style={moneyLabelStyle}>Target</p>

          <strong style={targetAmountStyle}>
            ₹{goal.targetAmount.toLocaleString("en-IN")}
          </strong>
        </div>
      </div>

      <div style={progressHeaderStyle}>
        <span style={progressLabelStyle}>
          Savings progress
        </span>

        <strong
          style={{
            ...progressPercentageStyle,
            color: progressColor,
          }}
        >
          {goal.progress.toFixed(1)}%
        </strong>
      </div>

      <div style={progressTrackStyle}>
        <div
          style={{
            width: `${displayProgress}%`,
            height: "100%",
            borderRadius: theme.radius.pill,
            background: progressColor,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      <div style={goalStatsStyle}>
        <GoalStat
          icon={<Wallet size={16} />}
          label="Remaining"
          value={`₹${Math.max(
            goal.remaining,
            0
          ).toLocaleString("en-IN")}`}
          color={theme.colors.primary}
          background={theme.colors.primarySoft}
        />

        <GoalStat
          icon={<Clock3 size={16} />}
          label={overdue ? "Deadline" : "Days Left"}
          value={
            completed
              ? "Achieved"
              : overdue
                ? "Overdue"
                : goal.daysLeft.toString()
          }
          color={
            completed
              ? theme.colors.success
              : overdue
                ? theme.colors.danger
                : theme.colors.warning
          }
          background={
            completed
              ? theme.colors.successSoft
              : overdue
                ? theme.colors.dangerSoft
                : theme.colors.warningSoft
          }
        />

        <GoalStat
          icon={<PiggyBank size={16} />}
          label="Progress"
          value={`${goal.progress.toFixed(1)}%`}
          color={
            completed
              ? theme.colors.success
              : theme.colors.info
          }
          background={
            completed
              ? theme.colors.successSoft
              : theme.colors.infoSoft
          }
        />
      </div>

      {!completed && (
        <div style={contributionAreaStyle}>
          {contributionOpen ? (
            <div style={contributionFormStyle}>
              <div style={contributionInputWrapperStyle}>
                <span style={smallCurrencyStyle}>₹</span>

                <input
                  type="number"
                  min="1"
                  value={contributionAmount}
                  onChange={(e) =>
                    setContributionAmount(e.target.value)
                  }
                  placeholder="Contribution amount"
                  style={contributionInputStyle}
                />
              </div>

              <button
                type="button"
                onClick={() => onContribution(goal._id)}
                style={saveContributionButtonStyle}
              >
                Save Contribution
              </button>

              <button
                type="button"
                onClick={onCloseContribution}
                style={cancelContributionButtonStyle}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenContribution(goal._id)}
              style={contributeButtonStyle}
            >
              <Plus size={16} />
              Add Contribution
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function GoalStat({
  icon,
  label,
  value,
  color,
  background,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  background: string;
}) {
  return (
    <div style={goalStatStyle}>
      <div
        style={{
          ...goalStatIconStyle,
          color,
          background,
        }}
      >
        {icon}
      </div>

      <div>
        <p style={goalStatLabelStyle}>{label}</p>
        <strong style={goalStatValueStyle}>{value}</strong>
      </div>
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
  color: theme.colors.text,
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

const goalsHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  marginBottom: "8px",
  flexWrap: "wrap" as const,
};

const overallBadgeStyle = {
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

const goalCardStyle = {
  padding: "22px 0",
};

const goalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "18px",
  flexWrap: "wrap" as const,
};

const goalIdentityStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  minWidth: 0,
};

const goalIconStyle = {
  width: "44px",
  height: "44px",
  flexShrink: 0,
  borderRadius: "13px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const goalNameRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  flexWrap: "wrap" as const,
};

const goalNameStyle = {
  margin: 0,
  color: theme.colors.text,
  fontSize: "15px",
};

const categoryBadgeStyle = {
  padding: "4px 8px",
  borderRadius: theme.radius.pill,
  background: theme.colors.surfaceSoft,
  color: theme.colors.textSecondary,
  fontSize: "9px",
  fontWeight: 700,
};

const statusBadgeStyle = {
  padding: "4px 8px",
  borderRadius: theme.radius.pill,
  fontSize: "9px",
  fontWeight: 700,
};

const deadlineStyle = {
  display: "flex",
  alignItems: "center",
  gap: "5px",
  marginTop: "6px",
  color: theme.colors.textMuted,
  fontSize: "10px",
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

const moneyProgressStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  marginTop: "22px",
};

const moneyLabelStyle = {
  margin: "0 0 5px",
  color: theme.colors.textMuted,
  fontSize: "10px",
};

const savedAmountStyle = {
  color: theme.colors.text,
  fontSize: "18px",
};

const targetAmountBoxStyle = {
  textAlign: "right" as const,
};

const targetAmountStyle = {
  color: theme.colors.textSecondary,
  fontSize: "14px",
};

const progressHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "18px",
  marginBottom: "8px",
};

const progressLabelStyle = {
  color: theme.colors.textMuted,
  fontSize: "11px",
};

const progressPercentageStyle = {
  fontSize: "12px",
};

const progressTrackStyle = {
  width: "100%",
  height: "10px",
  background: theme.colors.borderLight,
  borderRadius: theme.radius.pill,
  overflow: "hidden",
};

const goalStatsStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(120px, 1fr))",
  gap: "10px",
  marginTop: "18px",
};

const goalStatStyle = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  padding: "11px",
  borderRadius: theme.radius.medium,
  background: theme.colors.surfaceSoft,
};

const goalStatIconStyle = {
  width: "32px",
  height: "32px",
  flexShrink: 0,
  borderRadius: "9px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const goalStatLabelStyle = {
  margin: "0 0 3px",
  color: theme.colors.textMuted,
  fontSize: "9px",
};

const goalStatValueStyle = {
  color: theme.colors.text,
  fontSize: "12px",
};

const contributionAreaStyle = {
  marginTop: "18px",
};

const contributionFormStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap" as const,
};

const contributionInputWrapperStyle = {
  position: "relative" as const,
  flex: "1 1 180px",
};

const smallCurrencyStyle = {
  position: "absolute" as const,
  left: "12px",
  top: "50%",
  transform: "translateY(-50%)",
  color: theme.colors.textSecondary,
  fontWeight: 700,
};

const contributionInputStyle = {
  width: "100%",
  padding: "10px 12px 10px 30px",
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.small,
  outline: "none",
  boxSizing: "border-box" as const,
};

const contributeButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "9px 12px",
  border: "none",
  borderRadius: theme.radius.small,
  background: theme.colors.successSoft,
  color: theme.colors.success,
  cursor: "pointer",
  fontSize: "11px",
  fontWeight: 700,
};

const saveContributionButtonStyle = {
  padding: "10px 13px",
  border: "none",
  borderRadius: theme.radius.small,
  background: theme.colors.success,
  color: "#ffffff",
  cursor: "pointer",
  fontSize: "11px",
  fontWeight: 700,
};

const cancelContributionButtonStyle = {
  width: "36px",
  height: "36px",
  border: "none",
  borderRadius: theme.radius.small,
  background: theme.colors.surfaceSoft,
  color: theme.colors.textSecondary,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
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

export default Goals;