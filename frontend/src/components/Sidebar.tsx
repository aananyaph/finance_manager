import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  WalletCards,
  TrendingUp,
  Target,
  ChartNoAxesCombined,
  Sparkles,
  Upload,
} from "lucide-react";

type SidebarProps = {
  activePage: string;
  setActivePage: (page: string) => void;
};

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Transactions", icon: ArrowLeftRight },
  { name: "Budgets", icon: WalletCards },
  { name: "Investments", icon: TrendingUp },
  { name: "Goals", icon: Target },
  { name: "Import Statement", icon: Upload },
  { name: "Reports", icon: ChartNoAxesCombined },
  { name: "AI Advisor", icon: Sparkles },
 
];

function Sidebar({
  activePage,
  setActivePage,
}: SidebarProps) {
  const [windowWidth, setWindowWidth] = useState(
    window.innerWidth
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isMobile = windowWidth <= 650;
  const isCompact =
    windowWidth > 650 && windowWidth <= 1100;

  if (isMobile) {
    return (
      <aside style={mobileSidebarStyle}>
        <div style={mobileBrandStyle}>
          <div style={mobileLogoStyle}>F</div>

          <strong style={mobileBrandTextStyle}>
            FinWise
          </strong>
        </div>

        <nav style={mobileNavStyle}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.name;

            return (
              <button
                key={item.name}
                type="button"
                title={item.name}
                onClick={() => setActivePage(item.name)}
                style={{
                  ...mobileMenuButtonStyle,
                  ...(isActive
                    ? mobileActiveButtonStyle
                    : {}),
                }}
              >
                <Icon
                  size={19}
                  strokeWidth={isActive ? 2.4 : 1.8}
                />

                <span style={mobileMenuTextStyle}>
                  {item.name}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>
    );
  }

  return (
    <aside
      style={{
        ...sidebarStyle,
        position: "fixed",
        top: 0,
        left: 0,
        width: isCompact ? "78px" : "250px",
        minWidth: isCompact ? "78px" : "250px",
        padding: isCompact
          ? "24px 12px 18px"
          : "26px 18px 20px",
      }}
    >
      <div>
        <div
          style={{
            ...brandStyle,
            justifyContent: isCompact
              ? "center"
              : "flex-start",
            padding: isCompact ? 0 : "0 8px",
          }}
        >
          <div style={logoStyle}>F</div>

          {!isCompact && (
            <div>
              <h2 style={brandTitleStyle}>FinWise</h2>

              <p style={brandSubtitleStyle}>
                Personal Finance
              </p>
            </div>
          )}
        </div>

        {!isCompact && (
          <p style={menuLabelStyle}>MAIN MENU</p>
        )}

        <nav style={navStyle}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.name;

            return (
              <button
                key={item.name}
                type="button"
                title={isCompact ? item.name : undefined}
                onClick={() => setActivePage(item.name)}
                style={{
                  ...menuButtonStyle,
                  justifyContent: isCompact
                    ? "center"
                    : "space-between",
                  padding: isCompact ? 0 : "0 13px",
                  ...(isActive
                    ? activeMenuButtonStyle
                    : {}),
                }}
              >
                <div
                  style={{
                    ...menuContentStyle,
                    gap: isCompact ? 0 : "12px",
                  }}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.3 : 1.8}
                  />

                  {!isCompact && <span>{item.name}</span>}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      <div
        style={{
          ...bottomCardStyle,
          justifyContent: isCompact
            ? "center"
            : "flex-start",
          padding: isCompact ? "10px" : "13px",
        }}
      >
        <div style={bottomIconStyle}>
          <Sparkles size={18} />
        </div>

        {!isCompact && (
          <div>
            <p style={bottomTitleStyle}>
              Smart Finance
            </p>

            <p style={bottomTextStyle}>
              Track. Plan. Grow.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

const sidebarStyle = {
  minHeight: "100vh",
  background:
    "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
  color: "white",
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "space-between",
  boxSizing: "border-box" as const,
  position: "sticky",
  top: 0,
  left: 0,
  alignSelf: "flex-start" as const,
  maxHeight: "100vh",
  zIndex: 1000,
  flexShrink: 0,
  overflowY: "auto" as const,
  overflowX: "hidden" as const,
  transition: "width 0.25s ease, min-width 0.25s ease",
  boxShadow: "8px 0 30px rgba(15, 23, 42, 0.08)",
};

const brandStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "38px",
};

const logoStyle = {
  width: "42px",
  height: "42px",
  minWidth: "42px",
  borderRadius: "13px",
  background:
    "linear-gradient(135deg, #3b82f6, #6366f1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "21px",
  fontWeight: 800,
  boxShadow: "0 8px 20px rgba(59, 130, 246, 0.28)",
};

const brandTitleStyle = {
  margin: 0,
  fontSize: "20px",
  fontWeight: 750,
  letterSpacing: "-0.4px",
  whiteSpace: "nowrap" as const,
};

const brandSubtitleStyle = {
  margin: "3px 0 0",
  color: "#94a3b8",
  fontSize: "11px",
  whiteSpace: "nowrap" as const,
};

const menuLabelStyle = {
  margin: "0 12px 12px",
  color: "#64748b",
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "1.4px",
};

const navStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "6px",
};

const menuButtonStyle = {
  width: "100%",
  minHeight: "46px",
  border: "1px solid transparent",
  borderRadius: "11px",
  background: "transparent",
  color: "#94a3b8",
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 550,
  transition: "all 0.2s ease",
};

const activeMenuButtonStyle = {
  background:
    "linear-gradient(135deg, rgba(37, 99, 235, 0.95), rgba(79, 70, 229, 0.95))",
  color: "#ffffff",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  boxShadow: "0 8px 22px rgba(37, 99, 235, 0.22)",
};

const menuContentStyle = {
  display: "flex",
  alignItems: "center",
};

const bottomCardStyle = {
  marginTop: "auto",
  display: "flex",
  alignItems: "center",
  gap: "11px",
  borderRadius: "13px",
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.07)",
};

const bottomIconStyle = {
  width: "34px",
  height: "34px",
  minWidth: "34px",
  borderRadius: "10px",
  background: "rgba(59, 130, 246, 0.16)",
  color: "#60a5fa",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const bottomTitleStyle = {
  margin: 0,
  fontSize: "12px",
  fontWeight: 700,
  whiteSpace: "nowrap" as const,
};

const bottomTextStyle = {
  margin: "3px 0 0",
  color: "#64748b",
  fontSize: "10px",
  whiteSpace: "nowrap" as const,
};

const mobileSidebarStyle = {
  width: "100%",
  background:
    "linear-gradient(135deg, #0f172a, #111827)",
  color: "#ffffff",
  padding: "12px",
  boxSizing: "border-box" as const,
  position: "sticky" as const,
  top: 0,
  zIndex: 1000,
  overflowY: "auto" as const,
  overflowX: "hidden" as const,
};

const mobileBrandStyle = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  marginBottom: "12px",
};

const mobileLogoStyle = {
  width: "34px",
  height: "34px",
  borderRadius: "10px",
  background:
    "linear-gradient(135deg, #3b82f6, #6366f1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
};

const mobileBrandTextStyle = {
  fontSize: "17px",
};

const mobileNavStyle = {
  display: "flex",
  gap: "7px",
  overflowX: "auto" as const,
  paddingBottom: "3px",
};

const mobileMenuButtonStyle = {
  minWidth: "72px",
  padding: "8px 7px",
  border: "1px solid transparent",
  borderRadius: "10px",
  background: "transparent",
  color: "#94a3b8",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  gap: "5px",
  cursor: "pointer",
};

const mobileActiveButtonStyle = {
  background: "#2563eb",
  color: "#ffffff",
};

const mobileMenuTextStyle = {
  fontSize: "9px",
  whiteSpace: "nowrap" as const,
};

export default Sidebar;