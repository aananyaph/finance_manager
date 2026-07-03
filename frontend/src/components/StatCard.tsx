type StatCardProps = {
  title: string;
  value: number;
  icon: string;
};

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div
      style={{
        background: "white",
        padding: "24px",
        borderRadius: "14px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
        minWidth: "200px",
        flex: 1,
      }}
    >
      <div style={{ fontSize: "28px" }}>{icon}</div>

      <p style={{ color: "#6b7280" }}>{title}</p>

      <h2>₹{value.toLocaleString("en-IN")}</h2>
    </div>
  );
}

export default StatCard;