export const theme = {
  colors: {
    background: "#f6f8fc",
    surface: "#ffffff",
    surfaceSoft: "#f8fafc",

    primary: "#2563eb",
    primaryDark: "#1d4ed8",
    primarySoft: "#eff6ff",

    secondary: "#4f46e5",

    success: "#16a34a",
    successSoft: "#dcfce7",

    danger: "#dc2626",
    dangerSoft: "#fee2e2",

    warning: "#d97706",
    warningSoft: "#fef3c7",

    info: "#0284c7",
    infoSoft: "#e0f2fe",

    text: "#0f172a",
    textSecondary: "#475569",
    textMuted: "#94a3b8",

    border: "#e2e8f0",
    borderLight: "#f1f5f9",
  },

  radius: {
    small: "8px",
    medium: "12px",
    large: "16px",
    xlarge: "20px",
    pill: "999px",
  },

  shadow: {
    small: "0 2px 8px rgba(15, 23, 42, 0.04)",
    medium: "0 8px 24px rgba(15, 23, 42, 0.07)",
    large: "0 16px 40px rgba(15, 23, 42, 0.10)",
  },
};
export const layoutStyles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
    maxWidth: "100vw",
    overflowX: "hidden" as const,
    background: theme.colors.background,
    boxSizing: "border-box" as const,
  },

  main: {
    flex: 1,
    width: "100%",
    minWidth: 0,
    maxWidth: "100%",
    padding: "clamp(18px, 3vw, 36px)",
    overflowX: "hidden" as const,
    boxSizing: "border-box" as const,
  },

  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "clamp(20px, 3vw, 30px)",
    flexWrap: "wrap" as const,
  },

  pageTitle: {
    margin: 0,
    color: theme.colors.text,
    fontSize: "clamp(23px, 3vw, 28px)",
    fontWeight: 750,
    letterSpacing: "-0.7px",
  },

  pageSubtitle: {
    margin: "7px 0 0",
    color: theme.colors.textSecondary,
    fontSize: "clamp(12px, 1.5vw, 14px)",
    lineHeight: 1.5,
  },
};
export const cardStyles = {
  card: {
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.borderLight}`,
    borderRadius: theme.radius.large,
    boxShadow: theme.shadow.small,
  },

  paddedCard: {
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.borderLight}`,
    borderRadius: theme.radius.large,
    boxShadow: theme.shadow.small,
    padding: "22px",
  },

  interactiveCard: {
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.borderLight}`,
    borderRadius: theme.radius.large,
    boxShadow: theme.shadow.small,
    padding: "22px",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
};

export const buttonStyles = {
  primary: {
    padding: "10px 16px",
    border: "none",
    borderRadius: theme.radius.medium,
    background:
      "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 650,
    fontSize: "14px",
    boxShadow: "0 6px 16px rgba(37, 99, 235, 0.20)",
  },

  secondary: {
    padding: "10px 16px",
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.medium,
    background: theme.colors.surface,
    color: theme.colors.text,
    cursor: "pointer",
    fontWeight: 650,
    fontSize: "14px",
  },

  danger: {
    padding: "10px 16px",
    border: "none",
    borderRadius: theme.radius.medium,
    background: theme.colors.dangerSoft,
    color: theme.colors.danger,
    cursor: "pointer",
    fontWeight: 650,
    fontSize: "14px",
  },
};

export const inputStyles = {
  input: {
    width: "100%",
    padding: "11px 13px",
    marginTop: "6px",
    marginBottom: "16px",
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.medium,
    background: theme.colors.surface,
    color: theme.colors.text,
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box" as const,
  },

  select: {
    width: "100%",
    padding: "11px 13px",
    marginTop: "6px",
    marginBottom: "16px",
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.medium,
    background: theme.colors.surface,
    color: theme.colors.text,
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box" as const,
    cursor: "pointer",
  },
};

export const textStyles = {
  sectionTitle: {
    margin: 0,
    color: theme.colors.text,
    fontSize: "18px",
    fontWeight: 700,
    letterSpacing: "-0.3px",
  },

  label: {
    color: theme.colors.textSecondary,
    fontSize: "13px",
    fontWeight: 600,
  },

  muted: {
    color: theme.colors.textMuted,
    fontSize: "13px",
  },
};