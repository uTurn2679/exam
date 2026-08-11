"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUserAction } from "@/app/actions/authActions";
import { User, Mail, Lock, GraduationCap, UserPlus, ArrowRight, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }

    setIsSubmitting(true);
    const res = await registerUserAction({
      name,
      email,
      password,
      role: "STUDENT",
    });

    if (res.success && res.user) {
      router.push("/exams");
    } else {
      setError(res.error || "Registration failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 1rem" }}>
      <div style={{ width: "100%", maxWidth: "490px" }}>
        <div className="glass-panel" style={{ background: "white", padding: 0, borderRadius: "1.5rem", overflow: "hidden" }}>
          
          <div className="hero-gradient" style={{ padding: "2.5rem 2rem", color: "white", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(129, 140, 248, 0.18)", color: "#a5b4fc", padding: "0.35rem 0.85rem", borderRadius: "9999px", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              <GraduationCap size={16} /> Student Account Registration
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "white", marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
              Student Sign Up
            </h1>
            <p style={{ color: "#cbd5e1", fontSize: "0.95rem" }}>
              Create your student account to participate in online MCQ & CQ exams
            </p>
          </div>

          <div style={{ padding: "2.25rem" }}>
            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.9rem 1rem", borderRadius: "0.85rem", fontSize: "0.875rem", marginBottom: "1.5rem", fontWeight: 600 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: "1.25rem" }}>
                <label className="input-label">Student Full Name *</label>
                <div style={{ position: "relative" }}>
                  <User size={18} color="#94a3b8" style={{ position: "absolute", left: "1.1rem", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: "2.85rem" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label className="input-label">Student Email Address *</label>
                <div style={{ position: "relative" }}>
                  <Mail size={18} color="#94a3b8" style={{ position: "absolute", left: "1.1rem", top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="email"
                    required
                    placeholder="e.g. alex@school.edu"
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
                {isSubmitting ? "Creating Student Account..." : "Register as Student"} <UserPlus size={18} />
              </button>
            </form>

            <div style={{ borderTop: "1px solid #f1f5f9", marginTop: "1.75rem", paddingTop: "1.25rem", textAlign: "center", fontSize: "0.9rem", color: "#64748b" }}>
              Already registered?{" "}
              <Link href="/login" style={{ color: "#4f46e5", fontWeight: 700 }}>
                Sign In here <ArrowRight size={14} style={{ display: "inline" }} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
