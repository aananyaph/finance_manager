import React, { useState, useEffect } from "react";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";
import api from "../services/api";
import { theme } from "../styles/theme";

type LoginProps = {
  onLogin: () => void;
};

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("ananya@gmail.com");
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 960);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data));

      onLogin();
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      {/* Left Visual Banner Section */}
      {!isMobile && (
        <div style={visualSectionStyle}>
          <div style={glowOverlayStyle} />
          
          <div style={visualContentStyle}>
            <div style={logoBadgeStyle}>
              <span style={logoEmojiStyle}>💰</span>
              <span style={logoTextStyle}>FinWise</span>
            </div>

            <div style={heroTextWrapperStyle}>
              <h1 style={heroTitleStyle}>
                Take control of <br />
                <span style={gradientTextStyle}>your financial</span> destiny.
              </h1>
              <p style={heroSubStyle}>
                Track expenses, analyze investment growth, manage budgets, and receive AI-powered financial advisory recommendations.
              </p>
            </div>

            {/* Micro stats display */}
            <div style={statsContainerStyle}>
              <div style={statCardStyle}>
                <div style={statIconBoxStyle}>
                  <TrendingUp size={18} color={theme.colors.success} />
                </div>
                <div>
                  <span style={statLabelStyle}>MONTHLY SAVINGS</span>
                  <div style={statValueStyle}>+24.8%</div>
                </div>
              </div>
              
              <div style={statCardStyle}>
                <div style={statIconBoxStyle}>
                  <ShieldCheck size={18} color={theme.colors.info} />
                </div>
                <div>
                  <span style={statLabelStyle}>SECURITY RATING</span>
                  <div style={statValueStyle}>A+ Secure</div>
                </div>
              </div>
            </div>
          </div>

          <div style={footerCreditsStyle}>
            © 2026 FinWise Inc. All rights reserved.
          </div>
        </div>
      )}

      {/* Right Login Form Section */}
      <div style={formSectionStyle}>
        <div style={{ ...mobileHeaderStyle, display: isMobile ? "flex" : "none" }}>
          <span style={logoEmojiStyle}>💰</span>
          <span style={{ ...logoTextStyle, color: theme.colors.text }}>FinWise</span>
        </div>

        <div style={formCardStyle}>
          <div style={formHeaderStyle}>
            <h2 style={formTitleStyle}>Welcome back</h2>
            <p style={formSubStyle}>Please enter your details to sign in</p>
          </div>

          {message && (
            <div style={messageStyle}>
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Email Field */}
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Email Address</label>
              <div style={inputWrapperStyle}>
                <Mail size={18} style={inputIconStyle} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  disabled={loading}
                  style={inputElementStyle}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={inputGroupStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={labelStyle}>Password</label>
                <a href="#forgot" style={forgotLinkStyle} onClick={(e) => e.preventDefault()}>Forgot password?</a>
              </div>
              <div style={inputWrapperStyle}>
                <Lock size={18} style={inputIconStyle} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  style={inputElementStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={eyeButtonStyle}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...submitButtonStyle,
                opacity: loading ? 0.8 : 1,
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Quick Demo Credentials Help */}
          <div style={demoCredentialsBoxStyle}>
            <div style={demoTitleRowStyle}>
              <Sparkles size={14} color={theme.colors.warning} />
              <span style={demoTitleStyle}>DEMO CREDENTIALS PREFILLED</span>
            </div>
            <p style={demoDescStyle}>
              Use the default email <strong style={{ color: theme.colors.text }}>{email}</strong> and password <strong style={{ color: theme.colors.text }}>{password}</strong> to test features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styling definitions
const containerStyle: React.CSSProperties = {
  display: "flex",
  minHeight: "100vh",
  width: "100%",
  fontFamily: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  background: "#ffffff",
};

const visualSectionStyle: React.CSSProperties = {
  flex: 1.2,
  position: "relative",
  background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: "48px",
  color: "#ffffff",
  boxSizing: "border-box",
};

const glowOverlayStyle: React.CSSProperties = {
  position: "absolute",
  top: "20%",
  left: "30%",
  width: "500px",
  height: "500px",
  background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0) 70%)",
  filter: "blur(60px)",
  pointerEvents: "none",
};

const visualContentStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 2,
  display: "flex",
  flexDirection: "column",
  gap: "64px",
};

const logoBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "12px",
};

const logoEmojiStyle: React.CSSProperties = {
  fontSize: "28px",
};

const logoTextStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 800,
  letterSpacing: "-0.5px",
  color: "#ffffff",
};

const heroTextWrapperStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const heroTitleStyle: React.CSSProperties = {
  fontSize: "44px",
  fontWeight: 800,
  lineHeight: 1.15,
  letterSpacing: "-1.5px",
  margin: 0,
};

const gradientTextStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const heroSubStyle: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: 1.6,
  color: "#94a3b8",
  maxWidth: "460px",
  margin: 0,
};

const statsContainerStyle: React.CSSProperties = {
  display: "flex",
  gap: "20px",
  marginTop: "20px",
};

const statCardStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  background: "rgba(255, 255, 255, 0.03)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: theme.radius.medium,
  padding: "16px 20px",
  backdropFilter: "blur(10px)",
  minWidth: "180px",
};

const statIconBoxStyle: React.CSSProperties = {
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  background: "rgba(255, 255, 255, 0.05)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const statLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.5px",
  color: "#64748b",
};

const statValueStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 700,
  color: "#ffffff",
  marginTop: "4px",
};

const footerCreditsStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 2,
  fontSize: "13px",
  color: "#475569",
};

const formSectionStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: "40px",
  background: theme.colors.background,
  boxSizing: "border-box",
};

const mobileHeaderStyle: React.CSSProperties = {
  display: "none",
  alignItems: "center",
  gap: "10px",
  marginBottom: "32px",
};

const formCardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "440px",
  background: "#ffffff",
  border: `1px solid ${theme.colors.borderLight}`,
  borderRadius: theme.radius.large,
  boxShadow: theme.shadow.medium,
  padding: "40px",
  boxSizing: "border-box",
};

const formHeaderStyle: React.CSSProperties = {
  marginBottom: "32px",
};

const formTitleStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 800,
  letterSpacing: "-0.5px",
  color: theme.colors.text,
  margin: "0 0 8px 0",
};

const formSubStyle: React.CSSProperties = {
  fontSize: "14px",
  color: theme.colors.textSecondary,
  margin: 0,
};

const messageStyle: React.CSSProperties = {
  background: theme.colors.dangerSoft,
  color: theme.colors.danger,
  border: `1px solid rgba(220, 38, 38, 0.1)`,
  borderRadius: theme.radius.medium,
  padding: "12px 16px",
  marginBottom: "24px",
  fontSize: "13px",
  fontWeight: 500,
};

const inputGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  color: theme.colors.textSecondary,
};

const forgotLinkStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 600,
  color: theme.colors.primary,
  textDecoration: "none",
};

const inputWrapperStyle: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
};

const inputIconStyle: React.CSSProperties = {
  position: "absolute",
  left: "14px",
  color: theme.colors.textMuted,
  pointerEvents: "none",
};

const inputElementStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px 14px 44px",
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.medium,
  fontSize: "14px",
  color: theme.colors.text,
  background: "#ffffff",
  outline: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
};

const eyeButtonStyle: React.CSSProperties = {
  position: "absolute",
  right: "14px",
  background: "none",
  border: "none",
  color: theme.colors.textMuted,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
};

const submitButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  marginTop: "10px",
  border: "none",
  borderRadius: theme.radius.medium,
  background: "linear-gradient(135deg, #2563eb, #4f46e5)",
  color: "#ffffff",
  fontWeight: 700,
  fontSize: "15px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  boxShadow: "0 8px 20px rgba(37, 99, 235, 0.2)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
};

const demoCredentialsBoxStyle: React.CSSProperties = {
  marginTop: "32px",
  background: theme.colors.warningSoft,
  border: `1px solid rgba(217, 119, 6, 0.1)`,
  borderRadius: theme.radius.medium,
  padding: "16px",
};

const demoTitleRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "6px",
};

const demoTitleStyle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "1px",
  color: theme.colors.warning,
};

const demoDescStyle: React.CSSProperties = {
  fontSize: "12px",
  color: theme.colors.textSecondary,
  margin: 0,
  lineHeight: 1.5,
};

export default Login;