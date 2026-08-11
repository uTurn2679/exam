import Link from "next/link";
import { getStudentExamsAction } from "@/app/actions/examActions";
import { getAuthSessionAction } from "@/app/actions/authActions";
import { Clock, Calendar, FileText, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, Award, Eye, History, Layers, CheckSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentExamsPage() {
  const result = await getStudentExamsAction();
  const authRes = await getAuthSessionAction();
  const isAdmin = authRes.isLoggedIn && authRes.user?.role === "ADMIN";

  const exams = result.exams || [];
  const now = new Date();

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
                <Sparkles size={16} color="#818cf8" /> Smart Student Examination Portal
              </div>

              <h1 style={{ fontSize: "2.75rem", fontWeight: 800, color: "white", marginBottom: "0.85rem", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
                Online Assessment Center
              </h1>

              <p style={{ color: "#cbd5e1", fontSize: "1.08rem", lineHeight: 1.6 }}>
                Participate in scheduled MCQ auto-graded & CQ creative written exams. Upload answer paper photos, track countdown timers, and view your score & teacher feedback.
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
                <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>TOTAL EXAMS</span>
                <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "white" }}>{exams.length} Papers</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <div style={{ background: "rgba(16, 185, 129, 0.3)", padding: "0.6rem", borderRadius: "0.75rem", color: "#34d399" }}>
                <CheckSquare size={22} />
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>⚡ MCQ EXAMS</span>
                <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "white" }}>{mcqCount} Available</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <div style={{ background: "rgba(245, 158, 11, 0.3)", padding: "0.6rem", borderRadius: "0.75rem", color: "#fbbf24" }}>
                <FileText size={22} />
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>📄 CQ WRITTEN</span>
                <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "white" }}>{cqCount} Available</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Heading */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
              Available Examination Sessions
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.95rem" }}>Note: Strictly 1 attempt is allowed per student for each exam paper.</p>
          </div>
        </div>

        {exams.length === 0 ? (
          <div className="glass-panel" style={{ padding: "4.5rem 2rem", textAlign: "center", border: "2px dashed #cbd5e1", borderRadius: "1.5rem" }}>
            <div style={{ background: "#eff6ff", width: "76px", height: "76px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem auto" }}>
              <FileText size={40} color="#4f46e5" />
            </div>
            <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
              No Active Exams Currently Scheduled
            </h3>
            <p style={{ color: "#64748b", marginBottom: "1.75rem", maxWidth: "480px", margin: "0 auto 1.75rem auto" }}>
              There are no published assessment papers at the moment. Please check back later or contact your instructor.
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
                    padding: "1.85rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                    border: hasAttempted ? "2px solid #22c55e" : isActive ? "2px solid #6366f1" : "1px solid #e2e8f0",
                    background: hasAttempted ? "linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)" : isActive ? "linear-gradient(180deg, #ffffff 0%, #f5f3ff 100%)" : "white"
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

                    <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.6rem", letterSpacing: "-0.01em" }}>
                      {exam.title}
                    </h3>

                    {exam.description && (
                      <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.25rem", lineHeight: 1.5 }}>
                        {exam.description}
                      </p>
                    )}

                    {/* Metadata Card */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", background: "#f8fafc", padding: "1.1rem", borderRadius: "0.95rem", marginBottom: "1.5rem", fontSize: "0.875rem", border: "1px solid #f1f5f9" }}>
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
