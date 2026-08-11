"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Calendar, FileText, ArrowRight, BookOpen, Layers, CheckSquare, Eye, Sparkles } from "lucide-react";

export type ExamItem = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  subject: string;
  questionFileUrl: string | null;
  questionFileType: string | null;
  startTime: Date | string;
  endTime: Date | string;
  durationMinutes: number;
  totalMarks: number;
  passMarks: number;
  isPublished: boolean;
  _count: { questions: number };
  userSubmission: {
    id: string;
    status: string;
    totalScore: number | null;
    submittedAt: Date | string | null;
  } | null;
};

const SUBJECT_LIST = [
  { id: "ALL", label: "All Subjects", icon: "📚", color: "#4f46e5" },
  { id: "Math", label: "General Math", icon: "📐", color: "#2563eb" },
  { id: "Physics", label: "Physics", icon: "⚡", color: "#7c3aed" },
  { id: "Higher Math", label: "Higher Math", icon: "📊", color: "#0284c7" },
  { id: "Chemistry", label: "Chemistry", icon: "🧪", color: "#059669" },
];

export default function SubjectExamsClient({ exams, isAdmin }: { exams: ExamItem[]; isAdmin: boolean }) {
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const now = new Date();

  const filteredExams = selectedSubject === "ALL" 
    ? exams 
    : exams.filter(e => (e.subject || "General").toLowerCase() === selectedSubject.toLowerCase());

  const getSubjectBadge = (subjectName: string) => {
    switch ((subjectName || "General").toLowerCase()) {
      case "math":
        return { label: "📐 Math", bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" };
      case "physics":
        return { label: "⚡ Physics", bg: "#f5f3ff", text: "#6d28d9", border: "#ddd6fe" };
      case "higher math":
        return { label: "📊 Higher Math", bg: "#f0f9ff", text: "#0369a1", border: "#bae6fd" };
      case "chemistry":
        return { label: "🧪 Chemistry", bg: "#ecfdf5", text: "#047857", border: "#a7f3d0" };
      default:
        return { label: "📚 General", bg: "#f8fafc", text: "#475569", border: "#e2e8f0" };
    }
  };

  return (
    <div>
      {/* Subject Filter Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "0.65rem",
        marginBottom: "2.5rem",
        overflowX: "auto",
        paddingBottom: "0.5rem",
        WebkitOverflowScrolling: "touch"
      }}>
        {SUBJECT_LIST.map((subj) => {
          const isSelected = selectedSubject === subj.id;
          const count = subj.id === "ALL" ? exams.length : exams.filter(e => (e.subject || "General").toLowerCase() === subj.id.toLowerCase()).length;

          return (
            <button
              key={subj.id}
              onClick={() => setSelectedSubject(subj.id)}
              style={{
                padding: "0.65rem 1.2rem",
                borderRadius: "9999px",
                border: isSelected ? "2px solid #4f46e5" : "1px solid #e2e8f0",
                background: isSelected ? "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)" : "#ffffff",
                color: isSelected ? "#ffffff" : "#334155",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                whiteSpace: "nowrap",
                boxShadow: isSelected ? "0 8px 20px -4px rgba(79, 70, 229, 0.35)" : "0 2px 5px rgba(0,0,0,0.03)",
                transition: "all 0.25s ease"
              }}
            >
              <span>{subj.icon}</span>
              <span>{subj.label}</span>
              <span style={{
                fontSize: "0.75rem",
                padding: "0.15rem 0.5rem",
                borderRadius: "9999px",
                background: isSelected ? "rgba(255, 255, 255, 0.25)" : "#f1f5f9",
                color: isSelected ? "#ffffff" : "#64748b"
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Exam Grid */}
      {filteredExams.length === 0 ? (
        <div className="glass-panel" style={{ padding: "4rem 2rem", textAlign: "center", border: "2px dashed #cbd5e1", borderRadius: "1.5rem" }}>
          <div style={{ background: "#eff6ff", width: "70px", height: "70px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem auto" }}>
            <BookOpen size={36} color="#4f46e5" />
          </div>
          <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
            No Exams Available for {selectedSubject === "ALL" ? "Any Subject" : selectedSubject}
          </h3>
          <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
            There are currently no active exams listed under this subject. Please switch tabs or check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => {
            const start = new Date(exam.startTime);
            const end = new Date(exam.endTime);
            const isActive = now >= start && now <= end;
            const isUpcoming = now < start;
            const sub = exam.userSubmission;
            const hasAttempted = sub && sub.status !== "IN_PROGRESS";
            const sbjBadge = getSubjectBadge(exam.subject);

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
                  {/* Badges Bar: Subject Tag & Status */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.1rem" }}>
                    <span style={{
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      padding: "0.3rem 0.75rem",
                      borderRadius: "0.6rem",
                      background: sbjBadge.bg,
                      color: sbjBadge.text,
                      border: `1px solid ${sbjBadge.border}`,
                    }}>
                      {sbjBadge.label}
                    </span>

                    <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#4f46e5", background: "#f5f3ff", padding: "0.25rem 0.65rem", borderRadius: "0.5rem" }}>
                      {exam.totalMarks} Marks
                    </span>
                  </div>

                  {/* Status Pill */}
                  <div style={{ marginBottom: "1rem" }}>
                    <span style={{
                      fontSize: "0.725rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      padding: "0.35rem 0.75rem",
                      borderRadius: "9999px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      background: hasAttempted ? "#dcfce7" : sub?.status === "IN_PROGRESS" ? "#fef3c7" : isActive ? "#e0e7ff" : isUpcoming ? "#fef3c7" : "#f1f5f9",
                      color: hasAttempted ? "#15803d" : sub?.status === "IN_PROGRESS" ? "#b45309" : isActive ? "#3730a3" : isUpcoming ? "#b45309" : "#64748b"
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
                  </div>

                  <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem", letterSpacing: "-0.01em" }}>
                    {exam.title}
                  </h3>

                  {exam.description && (
                    <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1.1rem", lineHeight: 1.5 }}>
                      {exam.description}
                    </p>
                  )}

                  {/* Metadata Box */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", background: "#f8fafc", padding: "1rem", borderRadius: "0.85rem", marginBottom: "1.5rem", fontSize: "0.85rem", border: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", color: "#334155" }}>
                      <Calendar size={15} color="#4f46e5" />
                      <span><strong>Date:</strong> {start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", color: "#334155" }}>
                      <Clock size={15} color="#4f46e5" />
                      <span><strong>Duration:</strong> {exam.durationMinutes} Mins ({exam._count?.questions || 0} Questions)</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", color: "#334155" }}>
                      <FileText size={15} color="#4f46e5" />
                      <span><strong>Format:</strong> {exam.category === "CQ" ? "📄 CQ Written Paper" : "⚡ MCQ Auto-Graded"}</span>
                    </div>
                  </div>
                </div>

                {/* Button Actions */}
                {hasAttempted ? (
                  <Link
                    href={`/exams/${exam.id}/result/${sub.id}`}
                    className="btn"
                    style={{
                      width: "100%",
                      padding: "0.8rem",
                      borderRadius: "0.85rem",
                      fontSize: "0.9rem",
                      background: "#166534",
                      color: "white",
                      justifyContent: "center",
                      fontWeight: 700
                    }}
                  >
                    <Eye size={17} /> View Result & Paper
                  </Link>
                ) : sub?.status === "IN_PROGRESS" ? (
                  <Link
                    href={`/exams/${exam.id}/take`}
                    className="btn btn-primary"
                    style={{ width: "100%", padding: "0.8rem", borderRadius: "0.85rem", fontSize: "0.9rem" }}
                  >
                    Resume Exam Attempt <ArrowRight size={17} />
                  </Link>
                ) : isActive ? (
                  <Link
                    href={`/exams/${exam.id}/take`}
                    className="btn btn-primary"
                    style={{ width: "100%", padding: "0.8rem", borderRadius: "0.85rem", fontSize: "0.9rem" }}
                  >
                    Start Exam Session <ArrowRight size={17} />
                  </Link>
                ) : isUpcoming ? (
                  <button disabled className="btn" style={{ width: "100%", padding: "0.8rem", background: "#e2e8f0", color: "#94a3b8", cursor: "not-allowed", borderRadius: "0.85rem" }}>
                    Scheduled for Later
                  </button>
                ) : (
                  <button disabled className="btn" style={{ width: "100%", padding: "0.8rem", background: "#f1f5f9", color: "#94a3b8", cursor: "not-allowed", borderRadius: "0.85rem" }}>
                    Assessment Concluded
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
