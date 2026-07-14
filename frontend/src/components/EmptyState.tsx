import { ReactNode } from "react";
import { Plus } from "lucide-react";
import { buttonStyles, theme } from "../styles/theme";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
};

function EmptyState({
  icon,
  title,
  description,
  buttonText,
  onClick,
}: EmptyStateProps) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${theme.colors.borderLight}`,
        borderRadius: "18px",
        padding: "60px 30px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "72px",
          height: "72px",
          margin: "0 auto 22px",
          borderRadius: "18px",
          background: theme.colors.primarySoft,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: theme.colors.primary,
        }}
      >
        {icon}
      </div>

      <h2
        style={{
          margin: 0,
          color: theme.colors.text,
        }}
      >
        {title}
      </h2>

      <p
        style={{
          color: theme.colors.textMuted,
          margin: "12px auto 28px",
          maxWidth: "350px",
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>

      <button
        onClick={onClick}
        style={{
          ...buttonStyles.primary,
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Plus size={18} />
        {buttonText}
      </button>
    </div>
  );
}

export default EmptyState;