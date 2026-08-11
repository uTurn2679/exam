"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUserAction } from "@/app/actions/authActions";
import { User, Lock, GraduationCap, ArrowRight, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify passwords.");
      setLoading(false);
      return;
    }

    if (username.trim().length < 2) {
      setErrorMsg("Username must be at least 2 characters long.");
      setLoading(false);
      return;
    }

    const res = await registerUserAction({
      name: username.trim(),
      password,
    });

    if (res.success) {
      router.push("/exams");
      router.refresh();
    } else {
      setErrorMsg(res.error || "Registration failed");
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
            Student Sign Up
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
            Create a student account using Username & Password
          </p>
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
            <label className="input-label">Username *</label>
            <div style={{ position: "relative" }}>
              <User size={18} color="#94a3b8" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username (e.g. john123)"
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
                placeholder="Choose a password"
                className="input-field"
                style={{ paddingLeft: "2.75rem" }}
              />
            </div>
          </div>

          <div>
            <label className="input-label">Confirm Password *</label>
            <div style={{ position: "relative" }}>
              <Lock size={18} color="#94a3b8" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
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
                <span className="animate-spin">⏳</span> Registering...
              </span>
            ) : (
              <>
                <UserPlus size={18} /> Register Student Account <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: "1.75rem", textAlign: "center", fontSize: "0.9rem", color: "#64748b" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#4f46e5", fontWeight: 700, textDecoration: "underline" }}>
            Sign In with Username
          </Link>
        </div>
      </div>
    </div>
  );
}
