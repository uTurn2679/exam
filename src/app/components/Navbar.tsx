import Link from "next/link";
import { cookies } from "next/headers";
import { logoutUserAction } from "@/app/actions/authActions";
import { GraduationCap, ShieldCheck, BookOpen, LogIn, UserPlus, LogOut, User as UserIcon, Sparkles, History } from "lucide-react";

export default async function Navbar() {
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get("auth_session")?.value;
  const userName = cookieStore.get("auth_user_name")?.value;
  const role = cookieStore.get("auth_role")?.value;
  const isAdmin = role === "ADMIN";

  return (
    <nav style={{
      background: "rgba(255, 255, 255, 0.92)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
      padding: "0.75rem 0",
      position: "sticky",
      top: 0,
      zIndex: 50,
      boxShadow: "0 4px 20px -5px rgba(0, 0, 0, 0.04)"
    }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
        
        {/* Brand Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none" }}>
          <div style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #312e81 100%)",
            padding: "0.45rem",
            borderRadius: "0.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            boxShadow: "0 6px 14px -3px rgba(79, 70, 229, 0.4)"
          }}>
            <GraduationCap size={22} />
          </div>
          <div>
            <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.3rem", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              ExamPortal <Sparkles size={13} color="#6366f1" />
            </span>
            <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>
              Smart Student Assessment
            </span>
          </div>
        </Link>

        {/* Links & Auth State */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <Link href="/exams" className="btn btn-outline" style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem", borderRadius: "0.65rem" }}>
            <BookOpen size={15} /> Exams
          </Link>

          <Link href="/exams/history" className="btn btn-outline" style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem", borderRadius: "0.65rem" }}>
            <History size={15} color="#4f46e5" /> History & Results
          </Link>

          {isAdmin && (
            <Link href="/admin/exams" className="btn btn-dark" style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem", borderRadius: "0.65rem" }}>
              <ShieldCheck size={15} color="#818cf8" /> Admin
            </Link>
          )}

          {isLoggedIn ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              background: "#ffffff",
              padding: "0.25rem 0.65rem",
              borderRadius: "0.75rem",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <div style={{
                  background: isAdmin ? "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)" : "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                  color: isAdmin ? "#3730a3" : "#92400e",
                  padding: "0.3rem",
                  borderRadius: "50%",
                  display: "flex"
                }}>
                  <UserIcon size={14} />
                </div>
                <div style={{ fontSize: "0.8rem" }}>
                  <strong style={{ display: "block", color: "#0f172a", lineHeight: 1.1, fontWeight: 700 }}>{userName || "User"}</strong>
                  <span style={{ fontSize: "0.65rem", color: isAdmin ? "#4f46e5" : "#d97706", fontWeight: 800, textTransform: "uppercase" }}>{role}</span>
                </div>
              </div>

              <form action={logoutUserAction} style={{ display: "inline" }}>
                <button
                  type="submit"
                  style={{
                    background: "#fef2f2",
                    color: "#dc2626",
                    border: "1px solid #fecaca",
                    padding: "0.35rem 0.6rem",
                    borderRadius: "0.5rem",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem"
                  }}
                >
                  <LogOut size={13} /> Exit
                </button>
              </form>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Link href="/login" className="btn btn-outline" style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem", borderRadius: "0.65rem" }}>
                <LogIn size={15} /> Sign In
              </Link>
              <Link href="/register" className="btn btn-primary" style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem", borderRadius: "0.65rem" }}>
                <UserPlus size={15} /> Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
