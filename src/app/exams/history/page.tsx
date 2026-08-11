"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStudentHistoryAction } from "@/app/actions/examActions";
import MediaViewerModal from "@/app/components/MediaViewerModal";
import { Award, FileText, CheckCircle2, XCircle, ArrowLeft, History, Eye, Download, Sparkles, BookOpen, Maximize2, ExternalLink } from "lucide-react";

export default function StudentExamHistoryPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [allExams, setAllExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedQuestionExam, setSelectedQuestionExam] = useState<any>(null);

  // Fullscreen Lightbox state
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = useState("");

  const loadHistory = async () => {
    setLoading(true);
    const res = await getStudentHistoryAction();
    if (res.success) {
      setSubmissions(res.submissions || []);
      setAllExams(res.allExams || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const openFullscreen = (url: string, title: string) => {
    setViewerUrl(url);
    setViewerTitle(title);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "6rem 0" }}>
        <div className="animate-spin" style={{ width: "42px", height: "42px", border: "4px solid #cbd5e1", borderTopColor: "#4f46e5", borderRadius: "50%", margin: "0 auto 1rem auto" }}></div>
        <p style={{ color: "#64748b", fontWeight: 600 }}>Loading Your Exam History & Results Archive...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "3rem 0" }}>
      <div className="container" style={{ maxWidth: "1020px" }}>
        <Link href="/exams" className="nav-link" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginBottom: "1.5rem", fontWeight: 600, color: "#64748b" }}>
          <ArrowLeft size={16} /> Back to Active Exams Portal
        </Link>

        {/* Hero Banner */}
        <div className="hero-gradient" style={{
          borderRadius: "1.5rem",
          padding: "2.5rem 2rem",
          color: "white",
          marginBottom: "2.5rem",
          boxShadow: "0 20px 40px -10px rgba(15, 23, 42, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1.5rem"
        }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(129, 140, 248, 0.18)", color: "#a5b4fc", padding: "0.35rem 0.85rem", borderRadius: "9999px", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              <History size={15} /> Student Results & Question Paper Archive
            </div>
            <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "white", marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
              Previous Exams & Result History
            </h1>
            <p style={{ color: "#cbd5e1", fontSize: "0.95rem" }}>
              Review past scores, download submitted answer paper photos, and view original question papers in full screen.
            </p>
          </div>
        </div>

        {/* SECTION 1: MY ATTEMPTED RESULTS */}
        <div style={{ marginBottom: "3.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <Award size={22} color="#4f46e5" />
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a" }}>
              My Exam Results & Submissions ({submissions.length})
            </h2>
          </div>

          {submissions.length === 0 ? (
            <div className="glass-panel" style={{ padding: "3rem 2rem", textAlign: "center", border: "2px dashed #cbd5e1", borderRadius: "1.25rem" }}>
              <Award size={40} color="#94a3b8" style={{ margin: "0 auto 0.75rem auto" }} />
              <h3 style={{ fontSize: "1.2rem", color: "#334155", marginBottom: "0.35rem" }}>No Completed Exam Attempts Found</h3>
              <p style={{ color: "#64748b", fontSize: "0.9rem" }}>When you complete an assessment, your graded result paper will be stored here permanently.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {submissions.map((sub) => {
                const exam = sub.exam;
                const isPassed = (sub.totalScore || 0) >= (exam.passMarks || 40);
                const isGraded = sub.status === "GRADED";
                const isExpired = sub.status === "TIME_EXPIRED";

                return (
                  <div
                    key={sub.id}
                    className="glass-panel"
                    style={{
                      background: "white",
                      padding: "1.75rem",
                      borderRadius: "1.25rem",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
                        <span style={{
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          padding: "0.35rem 0.75rem",
                          borderRadius: "9999px",
                          background: isGraded ? (isPassed ? "#dcfce7" : "#fee2e2") : isExpired ? "#fee2e2" : "#fef3c7",
                          color: isGraded ? (isPassed ? "#15803d" : "#991b1b") : isExpired ? "#dc2626" : "#b45309"
                        }}>
                          {isGraded ? (isPassed ? "PASSED" : "FAILED") : isExpired ? "TIME EXPIRED" : "UNDER REVIEW"}
                        </span>

                        <span style={{ fontSize: "0.75rem", fontWeight: 800, background: "#f5f3ff", color: "#4f46e5", padding: "0.25rem 0.65rem", borderRadius: "0.5rem" }}>
                          {exam.category === "CQ" ? "📄 CQ Creative" : "⚡ MCQ"}
                        </span>
                      </div>

                      <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
                        {exam.title}
                      </h3>

                      <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "0.85rem", fontSize: "0.875rem", color: "#475569", marginBottom: "1.25rem", border: "1px solid #f1f5f9" }}>
                        <div><strong>Score:</strong> <span style={{ fontWeight: 800, color: isPassed ? "#16a34a" : "#dc2626" }}>{sub.totalScore ?? 0}</span> / {exam.totalMarks} Marks</div>
                        <div><strong>Attempted Date:</strong> {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "In Progress"}</div>
                        {sub.feedback && <div style={{ color: "#1d4ed8", marginTop: "0.35rem" }}><strong>Teacher Note:</strong> {sub.feedback}</div>}
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                      <Link href={`/exams/${exam.id}/result/${sub.id}`} className="btn btn-primary" style={{ justifyContent: "center", borderRadius: "0.75rem", fontSize: "0.85rem", padding: "0.6rem" }}>
                        <Eye size={15} /> Result Paper
                      </Link>
                      <button onClick={() => setSelectedQuestionExam(exam)} className="btn btn-outline" style={{ justifyContent: "center", borderRadius: "0.75rem", fontSize: "0.85rem", padding: "0.6rem" }}>
                        <FileText size={15} /> Questions
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 2: ALL PREVIOUS EXAMS & QUESTION PAPERS */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <BookOpen size={22} color="#4f46e5" />
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a" }}>
              All Past Exams & Question Papers Archive ({allExams.length})
            </h2>
          </div>

          {allExams.length === 0 ? (
            <div className="glass-panel" style={{ padding: "3rem 2rem", textAlign: "center", border: "2px dashed #cbd5e1", borderRadius: "1.25rem" }}>
              <BookOpen size={40} color="#94a3b8" style={{ margin: "0 auto 0.75rem auto" }} />
              <h3 style={{ fontSize: "1.2rem", color: "#334155" }}>No Exam Papers Available</h3>
            </div>
          ) : (
            <div className="glass-panel" style={{ background: "white", borderRadius: "1.25rem", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.95rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                    <th style={{ padding: "1rem 1.5rem", fontWeight: 700 }}>Exam Title</th>
                    <th style={{ padding: "1rem", fontWeight: 700 }}>Type</th>
                    <th style={{ padding: "1rem", fontWeight: 700 }}>Duration</th>
                    <th style={{ padding: "1rem", fontWeight: 700 }}>Total Marks</th>
                    <th style={{ padding: "1rem 1.5rem", fontWeight: 700, textAlign: "right" }}>Question Paper</th>
                  </tr>
                </thead>
                <tbody>
                  {allExams.map((exam) => (
                    <tr key={exam.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <div style={{ fontWeight: 800, color: "#0f172a" }}>{exam.title}</div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{new Date(exam.startTime).toLocaleDateString()}</div>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 800, background: exam.category === "CQ" ? "#fef3c7" : "#e0e7ff", color: exam.category === "CQ" ? "#b45309" : "#3730a3", padding: "0.25rem 0.65rem", borderRadius: "0.5rem" }}>
                          {exam.category === "CQ" ? "📄 CQ Creative" : "⚡ MCQ"}
                        </span>
                      </td>
                      <td style={{ padding: "1rem", color: "#475569" }}>{exam.durationMinutes} Mins</td>
                      <td style={{ padding: "1rem", fontWeight: 800, color: "#4f46e5" }}>{exam.totalMarks} Marks</td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                        <button
                          onClick={() => setSelectedQuestionExam(exam)}
                          className="btn btn-outline"
                          style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", borderRadius: "0.75rem" }}
                        >
                          <FileText size={15} /> View Questions & Solutions
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL: VIEW QUESTION PAPER & SOLUTIONS */}
        {selectedQuestionExam && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "1rem" }}>
            <div className="glass-panel" style={{ background: "white", width: "100%", maxWidth: "850px", padding: "2.25rem", borderRadius: "1.5rem", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#4f46e5", textTransform: "uppercase" }}>Original Question Paper & Solution Review</span>
                  <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a" }}>
                    {selectedQuestionExam.title} ({selectedQuestionExam.category === "CQ" ? "📄 CQ Creative Paper" : "⚡ MCQ Paper"})
                  </h2>
                </div>
                <button onClick={() => setSelectedQuestionExam(null)} className="btn btn-outline" style={{ padding: "0.4rem 0.9rem", borderRadius: "0.6rem" }}>
                  Close
                </button>
              </div>

              {/* CQ Question PDF / Image Attachment Viewer */}
              {selectedQuestionExam.category === "CQ" && selectedQuestionExam.questionFileUrl && (
                <div style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "1rem", border: "1px solid #cbd5e1", marginBottom: "2rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                      📄 Attached Question File ({selectedQuestionExam.questionFileType?.toUpperCase()})
                    </h4>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={() => openFullscreen(selectedQuestionExam.questionFileUrl, selectedQuestionExam.title + " - Question Paper")}
                        className="btn btn-outline"
                        style={{ fontSize: "0.85rem", padding: "0.4rem 0.85rem", background: "white" }}
                      >
                        <Maximize2 size={14} /> Fullscreen
                      </button>

                      <a
                        href={selectedQuestionExam.questionFileUrl}
                        download
                        className="btn btn-primary"
                        style={{ fontSize: "0.85rem", padding: "0.4rem 0.85rem" }}
                      >
                        <Download size={14} /> Download Question
                      </a>
                    </div>
                  </div>

                  {selectedQuestionExam.questionFileType === "pdf" ? (
                    <div>
                      <iframe
                        src={selectedQuestionExam.questionFileUrl}
                        style={{ width: "100%", height: "450px", border: "none", borderRadius: "0.75rem" }}
                        title="Question Paper PDF"
                      />
                    </div>
                  ) : (
                    <div>
                      <img
                        src={selectedQuestionExam.questionFileUrl}
                        alt="Question Paper Photo"
                        style={{ width: "100%", height: "auto", maxHeight: "500px", objectFit: "contain", borderRadius: "0.75rem" }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* MCQ & Text Questions & Solution Keys List */}
              {selectedQuestionExam.questions && selectedQuestionExam.questions.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {selectedQuestionExam.questions.map((q: any, idx: number) => {
                    let optionsList: string[] = [];
                    if (q.questionType === "MCQ" && q.options) {
                      try {
                        optionsList = JSON.parse(q.options);
                      } catch (e) {
                        optionsList = [];
                      }
                    }

                    return (
                      <div key={q.id} style={{ background: "#f8fafc", borderRadius: "1rem", padding: "1.25rem", border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                          <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>
                            Q{idx + 1}. {q.questionText}
                          </span>
                          <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#4f46e5" }}>
                            {q.marks} Marks
                          </span>
                        </div>

                        {q.questionType === "MCQ" ? (
                          <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {optionsList.map((opt, oIdx) => {
                              const isCorrect = q.correctAnswer && opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
                              return (
                                <div
                                  key={oIdx}
                                  style={{
                                    padding: "0.6rem 0.85rem",
                                    borderRadius: "0.6rem",
                                    background: isCorrect ? "#dcfce7" : "white",
                                    border: isCorrect ? "1.5px solid #22c55e" : "1px solid #e2e8f0",
                                    color: isCorrect ? "#15803d" : "#475569",
                                    fontSize: "0.875rem",
                                    fontWeight: isCorrect ? 800 : 400
                                  }}
                                >
                                  {opt} {isCorrect && " ✓ (Correct Answer)"}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "0.35rem" }}>
                            Written essay question. Review your graded response under Result Paper.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                !selectedQuestionExam.questionFileUrl && (
                  <p style={{ color: "#64748b", textAlign: "center" }}>No individual question items uploaded for this exam paper.</p>
                )
              )}

              <div style={{ marginTop: "2rem", textAlign: "right" }}>
                <button onClick={() => setSelectedQuestionExam(null)} className="btn btn-primary" style={{ borderRadius: "0.75rem" }}>
                  Close Review
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FULLSCREEN LIGHTBOX MODAL */}
        <MediaViewerModal
          url={viewerUrl}
          title={viewerTitle}
          isOpen={!!viewerUrl}
          onClose={() => setViewerUrl(null)}
        />
      </div>
    </div>
  );
}
