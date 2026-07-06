type SidebarProps = {
  activePage: string;
  setActivePage: (page: string) => void;
};

function Sidebar({ activePage, setActivePage }: SidebarProps) {
  const menuItems = [
    "Dashboard",
    "Transactions",
    "Budgets",
    "Investments",
    "Reports",
    "AI Advisor",
  ];

  return (
    <aside
      style={{
        width: "240px",
        minHeight: "100vh",
        background: "#111827",
        color: "white",
        padding: "24px",
        flexShrink: 0,
      }}
    >
      <h2 style={{ marginBottom: "40px" }}>
        💰 FinWise
      </h2>

      <nav>
        {menuItems.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setActivePage(item)}
            style={{
              display: "block",
              width: "100%",
              padding: "12px",
              marginBottom: "8px",
              border: "none",
              borderRadius: "8px",
              textAlign: "left",
              cursor: "pointer",
              background:
                activePage === item
                  ? "#2563eb"
                  : "transparent",
              color: "white",
            }}
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;