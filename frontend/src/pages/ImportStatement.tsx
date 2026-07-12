import Sidebar from "../components/Sidebar";
import FileUpload from "../components/FileUpload";
import {
  Upload,
  FileSpreadsheet,
  ShieldCheck,
  FileText,
} from "lucide-react";

import {
  layoutStyles,
  buttonStyles,
  cardStyles,
  theme,
} from "../styles/theme";

type Props = {
  onLogout: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
};

function ImportStatement({
  onLogout,
  activePage,
  setActivePage,
}: Props) {
  return (
    <div style={layoutStyles.page}>
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main style={layoutStyles.main}>
        <header style={layoutStyles.pageHeader}>
          <div>
            <p style={eyebrowStyle}>BANK IMPORT</p>

            <h1 style={layoutStyles.pageTitle}>
              Import Statement
            </h1>

            <p style={layoutStyles.pageSubtitle}>
              Upload your bank or UPI statement and let
              FinWise automatically organize your
              transactions.
            </p>
          </div>

          <button
            onClick={onLogout}
            style={buttonStyles.danger}
          >
            Logout
          </button>
        </header>

        <div style={heroStyle}>
          <div style={heroLeft}>
            <div style={heroIcon}>
              <Upload size={34} />
            </div>

            <div>
              <h2 style={heroTitle}>
                Smart Statement Import
              </h2>

              <p style={heroText}>
                Import hundreds of transactions in seconds.
                FinWise will soon categorize expenses,
                detect duplicates, and prepare everything
                for review.
              </p>
            </div>
          </div>

          <div style={heroBadge}>
            <ShieldCheck size={18} />
            Secure Upload
          </div>
        </div>

        <div style={contentGrid}>
          <FileUpload />

          <div style={cardStyles.paddedCard}>
            <p style={sectionLabel}>
              SUPPORTED FORMATS
            </p>

            <h2 style={sectionTitle}>
              Compatible Statements
            </h2>

            <div style={listStyle}>
              <Feature
                icon={<FileSpreadsheet size={18} />}
                title="CSV Statements"
                text="Most Indian banks"
              />

              <Feature
                icon={<FileText size={18} />}
                title="PhonePe Export"
                text="CSV transaction history"
              />

              <Feature
                icon={<FileText size={18} />}
                title="Google Pay"
                text="CSV statements"
              />

              <Feature
                icon={<FileText size={18} />}
                title="Paytm"
                text="CSV export"
              />

              <Feature
                icon={<FileSpreadsheet size={18} />}
                title="Excel (.xlsx)"
                text="Coming in Module 10.2"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div style={featureStyle}>
      <div style={featureIcon}>
        {icon}
      </div>

      <div>
        <strong>{title}</strong>

        <p style={featureText}>{text}</p>
      </div>
    </div>
  );
}

const eyebrowStyle = {
  margin: 0,
  color: theme.colors.primary,
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "1.6px",
};

const heroStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap" as const,
  gap: "20px",
  marginBottom: "24px",
  padding: "24px",
  borderRadius: "18px",
  background:
    "linear-gradient(135deg,#2563eb,#4f46e5)",
  color: "white",
};

const heroLeft = {
  display: "flex",
  gap: "18px",
  alignItems: "center",
};

const heroIcon = {
  width: "70px",
  height: "70px",
  borderRadius: "18px",
  background: "rgba(255,255,255,.15)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const heroTitle = {
  margin: 0,
  fontSize: "28px",
};

const heroText = {
  marginTop: "8px",
  maxWidth: "520px",
  lineHeight: 1.6,
  color: "#dbeafe",
};

const heroBadge = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "12px 16px",
  borderRadius: "999px",
  background: "rgba(255,255,255,.15)",
};

const contentGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(340px,1fr))",
  gap: "22px",
};

const sectionLabel = {
  color: theme.colors.primary,
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "1.5px",
};

const sectionTitle = {
  marginTop: "8px",
  marginBottom: "20px",
};

const listStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "16px",
};

const featureStyle = {
  display: "flex",
  gap: "14px",
  alignItems: "center",
};

const featureIcon = {
  width: "46px",
  height: "46px",
  borderRadius: "12px",
  background: theme.colors.primarySoft,
  color: theme.colors.primary,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const featureText = {
  marginTop: "4px",
  color: theme.colors.textMuted,
  fontSize: "13px",
};

export default ImportStatement;