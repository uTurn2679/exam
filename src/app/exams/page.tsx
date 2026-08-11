import Link from "next/link";
import { getStudentExamsAction } from "@/app/actions/examActions";
import { getAuthSessionAction } from "@/app/actions/authActions";
import { Clock, Calendar, FileText, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, Award, Eye, History } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentExamsPage() {
  const result = await getStudentExamsAction();
  const authRes = await getAuthSessionAction();
  const isAdmin = authRes.isLoggedIn && authRes.user?.role === "ADMIN";

  const exams = result.exams || [];
  const now = new Date();

  return (
    <div style={{ minHeight: "100vh", padding: "3rem 0" }}>
      <div className="container">
        {/* Header Hero Banner */}
        <div className="hero-gradient" style={{
          borderRadius: "1.5rem",
          padding: "3rem 2.5rem",
          color: "white",
          marginBottom: "3rem",
          boxShadow: "0 20px 40px -10px rgba(15, 23, 42, 0.3)",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem", position: "relative", zIndex: 2 }}>
            <div style={{ maxWidth: "680px" }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(129, 140, 248, 0.18)",
                color: "#a5b4fc",
                border: "1px solid rgba(129, 140, 248, 0.3)",
                padding: "0.4rem 1rem",
                borderRadius: "9999px",
                fontSize: "0.85rem",
                fontWeight: 700,
                marginBottom: "1rem",
                backdropFilter: "blur(8px)"
              }}>
                <Sparkles size={16} color="#818cf8" /> Official Student Portal (1 Attempt Rule Enforced)
              </div>

              <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "white", marginBottom: "0.75rem", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
                Online Examination Room
              </h1>

              <p style={{ color: "#cbd5e1", fontSize: "1.05rem", lineHeight: 1.6 }}>
                Participate in scheduled MCQ & CQ assessments. Upload written answer paper photos, track strict countdown timers, and view your score & teacher result feedback.
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link
                href="/exams/history"
                className="btn"
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  color: "white",
                  backdropFilter: "blur(8px)",
                  padding: "0.85rem 1.4rem",
                  borderRadius: "0.85rem",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  border: "1px solid rgba(255, 255, 255, 0.2)"
                }}
              >
                <History size={18} color="#a5b4fc" /> My Past Results & Questions
              </Link>

              {isAdmin && (
                <Link
                  href="/admin/exams"
                  className="btn btn-dark"
                  style={{
                    padding: "0.85rem 1.4rem",
                    borderRadius: "0.85rem",
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
                  }}
                >
                  <ShieldCheck size={18} color="#818cf8" /> Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Section Heading */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
          <div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
              Available Assessment Sessions
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Note: Each student gets exactly 1 attempt per exam paper.</p>
          </div>
        </div>

        {exams.length === 0 ? (
          <div className="glass-panel" style={{ padding: "4rem 2rem", textAlign: "center", border: "2px dashed #cbd5e1", borderRadius: "1.5rem" }}>
            <div style={{ background: "#eff6ff", width: "70px", height: "70px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem auto" }}>
              <FileText size={36} color="#4f46e5" />
            </div>
            <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
              No Active Exams Currently Scheduled
            </h3>
            <p style={{ color: "#64748b", marginBottom: "1.75rem", maxWidth: "450px", margin: "0 auto 1.75rem auto" }}>
              There are no published exam papers at the moment. Please check back later or contact your instructor.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <Link href="/exams/history" className="btn btn-outline" style={{ borderRadius: "0.75rem" }}>
                <History size={18} /> View Past Exam Archive
              </Link>
              {isAdmin && (
                <Link href="/admin/exams" className="btn btn-primary" style={{ borderRadius: "0.75rem" }}>
                  <ShieldCheck size={18} /> Create Exam (Admin Portal)
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => {
              const start = new Date(exam.startTime);
              const end = new Date(exam.endTime);
              const isActive = now >= start && now <= end;
              const isUpcoming = now < start;
              const sub = exam.userSubmission;
              const hasAttempted = sub && sub.status !== "IN_PROGRESS";

              return (
                <div
                  key={exam.id}
                  className="glass-panel"
                  style={{
                    padding: "1.75rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                    border: hasAttempted ? "2px solid #22c55e" : isActive ? "2px solid #6366f1" : "1px solid #e2e8f0",
                    background: hasAttempted ? "#f0fdf4" : isActive ? "linear-gradient(180deg, #ffffff 0%, #f5f3ff 100%)" : "white"
                  }}
                >
                  <div>
                    {/* Status Tag */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                      <span style={{
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        padding: "0.4rem 0.85rem",
                        borderRadius: "9999px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        background: hasAttempted ? "#dcfce7" : sub?.status === "IN_PROGRESS" ? "#fef3c7" : isActive ? "#e0e7ff" : isUpcoming ? "#fef3c7" : "#f1f5f9",
                        color: hasAttempted ? "#15803d" : sub?.status === "IN_PROGRESS" ? "#b45309" : isActive ? "#3730a3" : isUpcoming ? "#b45309" : "#64748b",
                        boxShadow: hasAttempted || isActive ? "0 4px 12px rgba(34, 197, 94, 0.15)" : "none"
                      }}>
                        {hasAttempted
                          ? sub.status === "GRADED" ? "✅ Graded (1/1 Attempt Used)" : "⏳ Submitted (1/1 Attempt Used)"
                          : sub?.status === "IN_PROGRESS"
                          ? "⏳ In Progress"
                          : isActive
                          ? "🟢 Active (1 Attempt Only)"
                          : isUpcoming
                          ? "⏳ Upcoming"
                          : "🔴 Concluded"}
                      </span>
                      <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#4f46e5", background: "#f5f3ff", padding: "0.25rem 0.65rem", borderRadius: "0.5rem" }}>
                        {exam.totalMarks} Marks
                      </span>
                    </div>

                    <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.6rem", letterSpacing: "-0.01em" }}>
                      {exam.title}
                    </h3>

                    {exam.description && (
                      <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.25rem", lineHeight: 1.5 }}>
                        {exam.description}
                      </p>
                    )}

                    {/* Metadata Card */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", background: "#f8fafc", padding: "1.1rem", borderRadius: "0.85rem", marginBottom: "1.5rem", fontSize: "0.875rem", border: "1px solid #f1f5f9" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#334155" }}>
                        <Calendar size={16} color="#4f46e5" />
                        <span><strong>Date:</strong> {start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#334155" }}>
                        <Clock size={16} color="#4f46e5" />
                        <span><strong>Time Limit:</strong> {exam.durationMinutes} Mins ({exam._count.questions} Questions)</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#334155" }}>
                        <FileText size={16} color="#4f46e5" />
                        <span><strong>Type:</strong> {exam.category === "CQ" ? "📄 CQ Written Exam" : "⚡ MCQ Auto-Graded"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions based on 1 Attempt Rule */}
                  {hasAttempted ? (
                    <Link
                      href={`/exams/${exam.id}/result/${sub.id}`}
                      className="btn"
                      style={{
                        width: "100%",
                        padding: "0.85rem",
                        borderRadius: "0.85rem",
                        fontSize: "0.95rem",
                        background: "#166534",
                        color: "white",
                        justifyContent: "center",
                        fontWeight: 700
                      }}
                    >
                      <Eye size={18} /> View Result & Answer Paper
                    </Link>
                  ) : sub?.status === "IN_PROGRESS" ? (
                    <Link
                      href={`/exams/${exam.id}/take`}
                      className="btn btn-primary"
                      style={{ width: "100%", padding: "0.85rem", borderRadius: "0.85rem", fontSize: "0.95rem" }}
                    >
                      Resume Exam Attempt <ArrowRight size={18} />
                    </Link>
                  ) : isActive ? (
                    <Link
                      href={`/exams/${exam.id}/take`}
                      className="btn btn-primary"
                      style={{ width: "100%", padding: "0.85rem", borderRadius: "0.85rem", fontSize: "0.95rem" }}
                    >
                      Start Exam Session (1 Attempt) <ArrowRight size={18} />
                    </Link>
                  ) : isUpcoming ? (
                    <button disabled className="btn" style={{ width: "100%", padding: "0.85rem", background: "#e2e8f0", color: "#94a3b8", cursor: "not-allowed", borderRadius: "0.85rem" }}>
                      Scheduled for Later
                    </button>
                  ) : (
                    <button disabled className="btn" style={{ width: "100%", padding: "0.85rem", background: "#f1f5f9", color: "#94a3b8", cursor: "not-allowed", borderRadius: "0.85rem" }}>
                      Assessment Concluded
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
