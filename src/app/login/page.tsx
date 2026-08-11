"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUserAction } from "@/app/actions/authActions";
import { Lock, User, GraduationCap, ShieldCheck, ArrowRight, UserCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [roleTab, setRoleTab] = useState<"STUDENT" | "ADMIN">("STUDENT");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const res = await loginUserAction({
      username,
      password,
      targetRole: roleTab,
    });

    if (res.success) {
      if (res.user?.role === "ADMIN" || roleTab === "ADMIN") {
        router.push("/admin/exams");
      } else {
        router.push("/exams");
      }
      router.refresh();
    } else {
      setErrorMsg(res.error || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 1rem" }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: "480px", padding: "2.5rem", borderRadius: "1.5rem" }}>
        
        {/* Logo & Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #312e81 100%)",
            width: "56px",
            height: "56px",
            borderRadius: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            margin: "0 auto 1rem auto",
            boxShadow: "0 10px 25px rgba(79, 70, 229, 0.4)"
          }}>
            <GraduationCap size={30} />
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.35rem", letterSpacing: "-0.02em" }}>
            Welcome Back
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
            Sign in with Username & Password to enter exam portal
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.5rem",
          background: "#f1f5f9",
          padding: "0.35rem",
          borderRadius: "0.95rem",
          marginBottom: "2rem"
        }}>
          <button
            type="button"
            onClick={() => { setRoleTab("STUDENT"); setErrorMsg(""); }}
            style={{
              padding: "0.65rem",
              borderRadius: "0.75rem",
              border: "none",
              background: roleTab === "STUDENT" ? "#ffffff" : "transparent",
              color: roleTab === "STUDENT" ? "#4f46e5" : "#64748b",
              fontWeight: 800,
              fontSize: "0.875rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.45rem",
              boxShadow: roleTab === "STUDENT" ? "0 4px 12px rgba(0, 0, 0, 0.05)" : "none",
              transition: "all 0.2s ease"
            }}
          >
            <UserCheck size={16} /> Student Login
          </button>

          <button
            type="button"
            onClick={() => { setRoleTab("ADMIN"); setErrorMsg(""); }}
            style={{
              padding: "0.65rem",
              borderRadius: "0.75rem",
              border: "none",
              background: roleTab === "ADMIN" ? "#4f46e5" : "transparent",
              color: roleTab === "ADMIN" ? "#ffffff" : "#64748b",
              fontWeight: 800,
              fontSize: "0.875rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.45rem",
              boxShadow: roleTab === "ADMIN" ? "0 4px 14px rgba(79, 70, 229, 0.35)" : "none",
              transition: "all 0.2s ease"
            }}
          >
            <ShieldCheck size={16} /> Admin Login
          </button>
        </div>

        {errorMsg && (
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            padding: "0.85rem 1rem",
            borderRadius: "0.85rem",
            fontSize: "0.9rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem"
          }}>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label className="input-label">
              {roleTab === "ADMIN" ? "Admin Username *" : "Username *"}
            </label>
            <div style={{ position: "relative" }}>
              <User size={18} color="#94a3b8" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={roleTab === "ADMIN" ? "habib" : "enter username"}
                className="input-field"
                style={{ paddingLeft: "2.75rem" }}
              />
            </div>
          </div>

          <div>
            <label className="input-label">Password *</label>
            <div style={{ position: "relative" }}>
              <Lock size={18} color="#94a3b8" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                style={{ paddingLeft: "2.75rem" }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.85rem", fontSize: "1rem", marginTop: "0.5rem" }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="animate-spin">⏳</span> Authenticating...
              </span>
            ) : (
              <>
                Sign In as {roleTab === "ADMIN" ? "Admin" : "Student"} <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: "1.75rem", textAlign: "center", fontSize: "0.9rem", color: "#64748b" }}>
          Need a student account?{" "}
          <Link href="/register" style={{ color: "#4f46e5", fontWeight: 700, textDecoration: "underline" }}>
            Register Username & Password
          </Link>
        </div>
      </div>
    </div>
  );
}
