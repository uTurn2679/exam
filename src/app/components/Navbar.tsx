import Link from "next/link";
import { cookies } from "next/headers";
import { logoutUserAction } from "@/app/actions/authActions";
import { GraduationCap, ShieldCheck, LogIn, UserPlus, LogOut, User as UserIcon, Sparkles, History, Home } from "lucide-react";

export default async function Navbar() {
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get("auth_session")?.value;
  const userName = cookieStore.get("auth_user_name")?.value;
  const role = cookieStore.get("auth_role")?.value;
  const isAdmin = role === "ADMIN";

  return (
    <nav style={{
      background: "rgba(255, 255, 255, 0.92)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
      padding: "0.75rem 0",
      position: "sticky",
      top: 0,
      zIndex: 50,
      boxShadow: "0 4px 20px -5px rgba(15, 23, 42, 0.05)"
    }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
        
        {/* Brand Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.65rem", textDecoration: "none" }}>
          <div style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #312e81 100%)",
            padding: "0.5rem",
            borderRadius: "0.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            boxShadow: "0 8px 18px -4px rgba(79, 70, 229, 0.45)"
          }}>
            <GraduationCap size={22} />
          </div>
          <div>
            <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.3rem", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              ExamPortal <Sparkles size={13} color="#6366f1" />
            </span>
            <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.01em" }}>
              Smart Student Assessment
            </span>
          </div>
        </Link>

        {/* 📱 HORIZONTAL SINGLE LINE NAVBAR WRAPPER */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "nowrap", overflowX: "auto", paddingBottom: "0.1rem", WebkitOverflowScrolling: "touch" }}>
          
          {/* Home Link */}
          <Link href="/" className="btn btn-outline" style={{ padding: "0.45rem 0.8rem", fontSize: "0.825rem", borderRadius: "0.7rem", minHeight: "38px" }}>
            <Home size={15} color="#4f46e5" /> Home
          </Link>

          {/* History & Results Link (ONLY shown when Signed In) */}
          {isLoggedIn && (
            <Link href="/exams/history" className="btn btn-outline" style={{ padding: "0.45rem 0.8rem", fontSize: "0.825rem", borderRadius: "0.7rem", minHeight: "38px" }}>
              <History size={15} color="#4f46e5" /> History
            </Link>
          )}

          {/* Admin Dashboard */}
          {isAdmin && (
            <Link href="/admin/exams" className="btn btn-dark" style={{ padding: "0.45rem 0.8rem", fontSize: "0.825rem", borderRadius: "0.7rem", minHeight: "38px" }}>
              <ShieldCheck size={15} color="#818cf8" /> Admin
            </Link>
          )}

          {/* Signed In State: Profile & Exit */}
          {isLoggedIn ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "nowrap" }}>
              {/* Profile Link */}
              <Link
                href="/profile"
                className="btn btn-outline"
                style={{
                  padding: "0.45rem 0.8rem",
                  fontSize: "0.825rem",
                  borderRadius: "0.7rem",
                  borderColor: "#818cf8",
                  background: "#f5f3ff",
                  color: "#3730a3",
                  fontWeight: 700,
                  minHeight: "38px"
                }}
              >
                <UserIcon size={15} color="#4f46e5" /> {userName || "Profile"}
              </Link>

              {/* Logout Button */}
              <form action={logoutUserAction} style={{ display: "inline" }}>
                <button
                  type="submit"
                  style={{
                    background: "#fef2f2",
                    color: "#dc2626",
                    border: "1px solid #fecaca",
                    padding: "0.45rem 0.75rem",
                    borderRadius: "0.7rem",
                    fontSize: "0.825rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    minHeight: "38px",
                    transition: "all 0.2s ease"
                  }}
                >
                  <LogOut size={14} /> Exit
                </button>
              </form>
            </div>
          ) : (
            /* Signed Out State: Sign In & Sign Up in ONE Single Line */
            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "nowrap" }}>
              <Link href="/login" className="btn btn-outline" style={{ padding: "0.45rem 0.8rem", fontSize: "0.825rem", borderRadius: "0.7rem", minHeight: "38px" }}>
                <LogIn size={15} /> Sign In
              </Link>
              <Link href="/register" className="btn btn-primary" style={{ padding: "0.45rem 0.85rem", fontSize: "0.825rem", borderRadius: "0.7rem", minHeight: "38px" }}>
                <UserPlus size={15} /> Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
