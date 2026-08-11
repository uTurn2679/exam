"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUserAction } from "@/app/actions/authActions";
import { GraduationCap, ShieldCheck, Mail, Lock, LogIn, ArrowRight, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"STUDENT" | "ADMIN">("STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await loginUserAction({
      email,
      password,
      targetRole: role,
    });

    if (res.success && res.user) {
      if (res.user.role === "ADMIN") {
        router.push("/admin/exams");
      } else {
        router.push("/exams");
      }
    } else {
      setError(res.error || "Login failed. Please check your credentials.");
      setIsSubmitting(false);
    }
  };

  const handleSelectAdminRole = () => {
    setRole("ADMIN");
    setError(null);
    setEmail("");
    setPassword("");
  };

  const handleSelectStudentRole = () => {
    setRole("STUDENT");
    setError(null);
    setEmail("");
    setPassword("");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 1rem" }}>
      <div style={{ width: "100%", maxWidth: "490px" }}>
        <div className="glass-panel" style={{ background: "white", padding: 0, borderRadius: "1.5rem", overflow: "hidden" }}>
          
          {/* Header Banner */}
          <div className="hero-gradient" style={{ padding: "2.5rem 2rem", color: "white", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(129, 140, 248, 0.18)", color: "#a5b4fc", padding: "0.35rem 0.85rem", borderRadius: "9999px", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              <Sparkles size={14} /> Secure Access Portal
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "white", marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
              Welcome Back
            </h1>
            <p style={{ color: "#cbd5e1", fontSize: "0.95rem", marginBottom: "1.75rem" }}>
              Sign in to participate in exams or manage assessment papers
            </p>

            {/* Role Tabs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "rgba(255, 255, 255, 0.08)", padding: "0.3rem", borderRadius: "0.85rem", border: "1px solid rgba(255, 255, 255, 0.12)" }}>
              <button
                type="button"
                onClick={handleSelectStudentRole}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.45rem",
                  padding: "0.7rem",
                  borderRadius: "0.65rem",
                  border: "none",
                  fontWeight: 800,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  background: role === "STUDENT" ? "#4f46e5" : "transparent",
                  color: role === "STUDENT" ? "white" : "#cbd5e1",
                  boxShadow: role === "STUDENT" ? "0 4px 14px rgba(79, 70, 229, 0.4)" : "none"
                }}
              >
                <GraduationCap size={18} /> Student Login
              </button>

              <button
                type="button"
                onClick={handleSelectAdminRole}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.45rem",
                  padding: "0.7rem",
                  borderRadius: "0.65rem",
                  border: "none",
                  fontWeight: 800,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  background: role === "ADMIN" ? "#4f46e5" : "transparent",
                  color: role === "ADMIN" ? "white" : "#cbd5e1",
                  boxShadow: role === "ADMIN" ? "0 4px 14px rgba(79, 70, 229, 0.4)" : "none"
                }}
              >
                <ShieldCheck size={18} /> Admin Login
              </button>
            </div>
          </div>

          <div style={{ padding: "2.25rem" }}>
            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.9rem 1rem", borderRadius: "0.85rem", fontSize: "0.875rem", marginBottom: "1.5rem", fontWeight: 600 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: "1.25rem" }}>
                <label className="input-label">{role === "ADMIN" ? "Admin Username / Email *" : "Student Email Address *"}</label>
                <div style={{ position: "relative" }}>
                  <Mail size={18} color="#94a3b8" style={{ position: "absolute", left: "1.1rem", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    required
                    placeholder={role === "ADMIN" ? "e.g. habib" : "e.g. student@school.edu"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: "2.85rem" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "2rem" }}>
                <label className="input-label">Password *</label>
                <div style={{ position: "relative" }}>
                  <Lock size={18} color="#94a3b8" style={{ position: "absolute", left: "1.1rem", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: "2.85rem" }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ width: "100%", padding: "0.95rem", fontSize: "1.05rem", borderRadius: "0.85rem" }}
              >
                {isSubmitting ? "Signing In..." : `Sign In as ${role === "ADMIN" ? "Admin" : "Student"}`} <LogIn size={18} />
              </button>
            </form>

            <div style={{ borderTop: "1px solid #f1f5f9", marginTop: "1.75rem", paddingTop: "1.25rem", textAlign: "center", fontSize: "0.9rem", color: "#64748b" }}>
              Need a student account?{" "}
              <Link href="/register" style={{ color: "#4f46e5", fontWeight: 700 }}>
                Register Student Account <ArrowRight size={14} style={{ display: "inline" }} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
