import Link from "next/link";
import { getStudentExamsAction } from "@/app/actions/examActions";
import { getAuthSessionAction } from "@/app/actions/authActions";
import SubjectExamsClient from "./SubjectExamsClient";
import { ShieldCheck, Sparkles, History, Layers, CheckSquare, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentExamsPage() {
  const result = await getStudentExamsAction();
  const authRes = await getAuthSessionAction();
  const isAdmin = authRes.isLoggedIn && authRes.user?.role === "ADMIN";

  const exams = (result.exams || []) as any[];
  const mcqCount = exams.filter(e => e.category === "MCQ").length;
  const cqCount = exams.filter(e => e.category === "CQ").length;

  return (
    <div style={{ minHeight: "100vh", padding: "3rem 0" }}>
      <div className="container">
        {/* Header Hero Banner */}
        <div className="hero-gradient" style={{
          padding: "3.5rem 2.5rem",
          color: "white",
          marginBottom: "3rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.75rem", position: "relative", zIndex: 2 }}>
            <div style={{ maxWidth: "700px" }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(129, 140, 248, 0.2)",
                color: "#a5b4fc",
                border: "1px solid rgba(129, 140, 248, 0.35)",
                padding: "0.45rem 1.1rem",
                borderRadius: "9999px",
                fontSize: "0.85rem",
                fontWeight: 700,
                marginBottom: "1.25rem",
                backdropFilter: "blur(12px)"
              }}>
                <Sparkles size={16} color="#818cf8" /> Subject-Wise Student Examination Portal
              </div>

              <h1 style={{ fontSize: "2.75rem", fontWeight: 800, color: "white", marginBottom: "0.85rem", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
                Online Subject Assessment Center
              </h1>

              <p style={{ color: "#cbd5e1", fontSize: "1.08rem", lineHeight: 1.6 }}>
                Select your subject: <strong>Math</strong>, <strong>Physics</strong>, <strong>Higher Math</strong>, or <strong>Chemistry</strong>. Participate in scheduled MCQ & CQ exams, view questions, upload answer photos, and track scores.
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap" }}>
              <Link
                href="/exams/history"
                className="btn"
                style={{
                  background: "rgba(255, 255, 255, 0.16)",
                  color: "white",
                  backdropFilter: "blur(12px)",
                  padding: "0.85rem 1.5rem",
                  borderRadius: "0.85rem",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  border: "1px solid rgba(255, 255, 255, 0.25)"
                }}
              >
                <History size={18} color="#a5b4fc" /> My Past Results & Questions
              </Link>

              {isAdmin && (
                <Link
                  href="/admin/exams"
                  className="btn btn-dark"
                  style={{
                    padding: "0.85rem 1.5rem",
                    borderRadius: "0.85rem",
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.65rem",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
                  }}
                >
                  <ShieldCheck size={18} color="#818cf8" /> Admin Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", background: "rgba(255, 255, 255, 0.07)", padding: "1.25rem 1.75rem", borderRadius: "1.1rem", border: "1px solid rgba(255, 255, 255, 0.12)", position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <div style={{ background: "rgba(99, 102, 241, 0.3)", padding: "0.6rem", borderRadius: "0.75rem", color: "#a5b4fc" }}>
                <Layers size={22} />
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>TOTAL PAPERS</span>
                <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "white" }}>{exams.length} Exams</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <div style={{ background: "rgba(16, 185, 129, 0.3)", padding: "0.6rem", borderRadius: "0.75rem", color: "#34d399" }}>
                <CheckSquare size={22} />
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>⚡ MCQ EXAMS</span>
                <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "white" }}>{mcqCount} Papers</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <div style={{ background: "rgba(245, 158, 11, 0.3)", padding: "0.6rem", borderRadius: "0.75rem", color: "#fbbf24" }}>
                <FileText size={22} />
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>📄 CQ WRITTEN</span>
                <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "white" }}>{cqCount} Papers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Heading */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
            Subject Wise Exam Sessions
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.95rem" }}>Filter by Math, Physics, Higher Math, or Chemistry to find your exam paper.</p>
        </div>

        {/* Subject Filter & Interactive Grid */}
        <SubjectExamsClient exams={exams} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
