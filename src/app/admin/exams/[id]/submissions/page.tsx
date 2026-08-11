"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getExamWithQuestionsAction, getExamSubmissionsAction, getSubmissionDetailsAction, gradeSubmissionAction } from "@/app/actions/examActions";
import MediaViewerModal from "@/app/components/MediaViewerModal";
import { ArrowLeft, Eye, Save, FileCheck, FileText, Download, Maximize2, Image as ImageIcon, AlertCircle } from "lucide-react";

export default function AdminExamSubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: examId } = use(params);

  const [exam, setExam] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [manualMarks, setManualMarks] = useState<Record<string, number>>({});
  const [cqManualScore, setCqManualScore] = useState<number>(0);
  const [teacherFeedback, setTeacherFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fullscreen Lightbox state
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = useState("");

  const loadData = async () => {
    setLoading(true);
    const examRes = await getExamWithQuestionsAction(examId);
    if (examRes.success && examRes.exam) {
      setExam(examRes.exam);
    }

    const subRes = await getExamSubmissionsAction(examId);
    if (subRes.success) {
      setSubmissions(subRes.submissions || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [examId]);

  const openFullscreen = (url: string, title: string) => {
    setViewerUrl(url);
    setViewerTitle(title);
  };

  const handleOpenGradingPaper = async (subId: string) => {
    const res = await getSubmissionDetailsAction(subId);
    if (res.success && res.submission) {
      setSelectedSubmission(res.submission);
      setTeacherFeedback(res.submission.feedback || "");
      setCqManualScore(res.submission.totalScore || 0);

      const initMarks: Record<string, number> = {};
      res.submission.answers.forEach((ans: any) => {
        if (ans.question.questionType === "TEXT") {
          initMarks[ans.questionId] = ans.marksObtained ?? 0;
        }
      });
      setManualMarks(initMarks);
    } else {
      alert("Failed to load submission paper details.");
    }
  };

  const handleSaveGrades = async () => {
    if (!selectedSubmission) return;

    setIsSaving(true);
    const updatedMarks = { ...manualMarks, _cq_manual_score: Number(cqManualScore || 0) };
    const res = await gradeSubmissionAction(selectedSubmission.id, updatedMarks, teacherFeedback);
    if (res.success) {
      alert("Grade and feedback saved successfully!");
      setSelectedSubmission(null);
      loadData();
    } else {
      alert("Error saving grades: " + res.error);
    }
    setIsSaving(false);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 0" }}>
        <div className="animate-spin" style={{ width: "42px", height: "42px", border: "4px solid #cbd5e1", borderTopColor: "#4f46e5", borderRadius: "50%", margin: "0 auto 1rem auto" }}></div>
        <p style={{ color: "#64748b", fontWeight: 600 }}>Loading Student Answer Papers...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="container" style={{ padding: "4rem 0" }}>
        <h2>Exam Not Found</h2>
        <Link href="/admin/exams" className="btn btn-primary" style={{ marginTop: "1rem" }}>Back to Admin Dashboard</Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "3rem 0" }}>
      <div className="container" style={{ maxWidth: "1000px" }}>
        <Link href="/admin/exams" className="nav-link" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginBottom: "1.5rem", fontWeight: 600, color: "#64748b" }}>
          <ArrowLeft size={16} /> Back to Exam Dashboard
        </Link>

        {/* Header */}
        <div className="glass-panel" style={{ background: "white", padding: "2rem", borderRadius: "1.25rem", marginBottom: "2rem" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#4f46e5", textTransform: "uppercase" }}>Answer Paper Review & Grading</span>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
            {exam.title} ({exam.category === "CQ" ? "📄 CQ Creative Paper" : "⚡ MCQ Exam"}) - Submissions
          </h1>
          <p style={{ color: "#64748b" }}>
            Total Answer Papers: <strong>{submissions.length}</strong> • Maximum Score: <strong>{exam.totalMarks} Marks</strong>
          </p>
        </div>

        {/* Submissions Table */}
        {submissions.length === 0 ? (
          <div className="glass-panel" style={{ padding: "4rem 2rem", textAlign: "center", border: "2px dashed #cbd5e1", borderRadius: "1.5rem" }}>
            <FileCheck size={48} color="#94a3b8" style={{ margin: "0 auto 1rem auto" }} />
            <h3 style={{ fontSize: "1.35rem", color: "#334155", marginBottom: "0.5rem" }}>No Answer Papers Submitted Yet</h3>
            <p style={{ color: "#64748b" }}>As soon as students participate in this exam, their answer papers will appear here for grading.</p>
          </div>
        ) : (
          <div className="glass-panel" style={{ background: "white", borderRadius: "1.25rem", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.95rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 700 }}>Student Name</th>
                  <th style={{ padding: "1rem", fontWeight: 700 }}>Submission Time</th>
                  <th style={{ padding: "1rem", fontWeight: 700 }}>Status</th>
                  <th style={{ padding: "1rem", fontWeight: 700 }}>Score</th>
                  <th style={{ padding: "1rem 1.5rem", fontWeight: 700, textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => {
                  const isGraded = sub.status === "GRADED";
                  const isExpired = sub.status === "TIME_EXPIRED";

                  let fileList: string[] = [];
                  if (sub.answerFiles) {
                    try {
                      fileList = JSON.parse(sub.answerFiles);
                    } catch (e) {
                      fileList = sub.answerFileUrl ? [sub.answerFileUrl] : [];
                    }
                  } else if (sub.answerFileUrl) {
                    fileList = [sub.answerFileUrl];
                  }

                  return (
                    <tr key={sub.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <div style={{ fontWeight: 800, color: "#0f172a" }}>{sub.studentName}</div>
                        {sub.studentEmail && <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{sub.studentEmail}</div>}
                        {fileList.length > 0 ? (
                          <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 700, display: "block", marginTop: "0.2rem" }}>
                            🖼️ Attached Pictures ({fileList.length} File(s))
                          </span>
                        ) : exam.category === "CQ" ? (
                          <span style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: 600, display: "block", marginTop: "0.2rem" }}>
                            ⚠️ No photos attached
                          </span>
                        ) : null}
                      </td>
                      <td style={{ padding: "1rem", color: "#475569" }}>
                        {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : "In Progress"}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          padding: "0.35rem 0.75rem",
                          borderRadius: "9999px",
                          background: isGraded ? "#dcfce7" : isExpired ? "#fee2e2" : "#fef3c7",
                          color: isGraded ? "#15803d" : isExpired ? "#dc2626" : "#b45309"
                        }}>
                          {isGraded ? "GRADED" : isExpired ? "TIME EXPIRED" : "NEEDS REVIEW"}
                        </span>
                      </td>
                      <td style={{ padding: "1rem", fontWeight: 800, color: (sub.totalScore || 0) >= exam.passMarks ? "#16a34a" : "#dc2626" }}>
                        {sub.totalScore ?? 0} / {exam.totalMarks}
                      </td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                        <button
                          onClick={() => handleOpenGradingPaper(sub.id)}
                          className="btn btn-primary"
                          style={{ padding: "0.55rem 1.1rem", fontSize: "0.85rem", borderRadius: "0.75rem" }}
                        >
                          <Eye size={15} /> Grade Paper
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal for Grading Answer Paper */}
        {selectedSubmission && (() => {
          let fileList: string[] = [];
          if (selectedSubmission.answerFiles) {
            try {
              fileList = JSON.parse(selectedSubmission.answerFiles);
            } catch (e) {
              fileList = selectedSubmission.answerFileUrl ? [selectedSubmission.answerFileUrl] : [];
            }
          } else if (selectedSubmission.answerFileUrl) {
            fileList = [selectedSubmission.answerFileUrl];
          }

          return (
            <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "1rem" }}>
              <div className="glass-panel" style={{ background: "white", width: "100%", maxWidth: "900px", padding: "2.25rem", borderRadius: "1.5rem", maxHeight: "90vh", overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#4f46e5", textTransform: "uppercase" }}>Answer Paper Review Room</span>
                    <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a" }}>
                      Student: {selectedSubmission.studentName}
                    </h2>
                  </div>
                  <button onClick={() => setSelectedSubmission(null)} className="btn btn-outline" style={{ padding: "0.4rem 0.9rem", borderRadius: "0.6rem" }}>
                    Close
                  </button>
                </div>

                {/* Multiple Student Uploaded Answer Pictures / Files Viewer with Fullscreen & Download */}
                {fileList.length > 0 ? (
                  <div style={{ background: "#f8fafc", borderRadius: "1rem", padding: "1.5rem", border: "1px solid #cbd5e1", marginBottom: "2rem" }}>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      🖼️ Student Answer Paper Pictures ({fileList.length} Attached File(s))
                    </h4>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.25rem", marginBottom: "1.25rem" }}>
                      {fileList.map((fileUrl, index) => {
                        const isPdf = fileUrl.toLowerCase().includes(".pdf") || fileUrl.startsWith("data:application/pdf");
                        return (
                          <div key={index} style={{ background: "white", borderRadius: "0.85rem", padding: "0.75rem", border: "1px solid #e2e8f0", textAlign: "center" }}>
                            {isPdf ? (
                              <div style={{ padding: "1.5rem 0" }}>
                                <FileText size={40} color="#2563eb" style={{ margin: "0 auto 0.5rem auto" }} />
                                <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", display: "block", marginBottom: "0.5rem" }}>
                                  Answer PDF #{index + 1}
                                </span>
                              </div>
                            ) : (
                              <div>
                                <img
                                  src={fileUrl}
                                  alt={`Student Picture Page ${index + 1}`}
                                  style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "0.5rem", marginBottom: "0.5rem", cursor: "pointer" }}
                                  onClick={() => openFullscreen(fileUrl, `${selectedSubmission.studentName} - Photo #${index + 1}`)}
                                />
                              </div>
                            )}

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                              <button
                                type="button"
                                onClick={() => openFullscreen(fileUrl, `${selectedSubmission.studentName} - File #${index + 1}`)}
                                className="btn btn-outline"
                                style={{ fontSize: "0.75rem", padding: "0.35rem 0.5rem", borderRadius: "0.5rem" }}
                              >
                                <Maximize2 size={13} /> Fullscreen
                              </button>

                              <a
                                href={fileUrl}
                                download
                                className="btn btn-primary"
                                style={{ fontSize: "0.75rem", padding: "0.35rem 0.5rem", borderRadius: "0.5rem" }}
                              >
                                <Download size={13} /> Download
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "center", gap: "1rem", background: "white", padding: "1rem", borderRadius: "0.85rem", border: "1px solid #e2e8f0" }}>
                      <label style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.95rem" }}>Assign CQ Answer Paper Score (Max {exam.totalMarks}):</label>
                      <input
                        type="number"
                        min={0}
                        max={exam.totalMarks}
                        step={0.5}
                        value={cqManualScore}
                        onChange={(e) => setCqManualScore(Number(e.target.value))}
                        className="input-field"
                        style={{ width: "120px" }}
                      />
                    </div>
                  </div>
                ) : (
                  exam.category === "CQ" && (
                    <div style={{ background: "#fffbeb", padding: "1.25rem", borderRadius: "1rem", border: "1px solid #fcd34d", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <AlertCircle size={24} color="#b45309" />
                      <div>
                        <h4 style={{ fontWeight: 800, color: "#92400e", fontSize: "0.95rem" }}>No Answer Photos Attached</h4>
                        <p style={{ fontSize: "0.85rem", color: "#b45309" }}>This student submitted an answer paper without attaching written script photos.</p>
                      </div>
                    </div>
                  )
                )}

                {/* Answers Review List */}
                {selectedSubmission.exam.questions.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "2rem" }}>
                    {selectedSubmission.exam.questions.map((q: any, idx: number) => {
                      const ans = selectedSubmission.answers.find((a: any) => a.questionId === q.id);

                      return (
                        <div key={q.id} style={{ background: "#f8fafc", borderRadius: "0.85rem", padding: "1.25rem", border: "1px solid #e2e8f0" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                            <span style={{ fontSize: "0.875rem", fontWeight: 800, color: "#334155" }}>
                              Q{idx + 1}. {q.questionText} ({q.marks} Marks)
                            </span>
                            <span style={{ fontSize: "0.8rem", fontWeight: 800, color: ans?.isCorrect ? "#16a34a" : ans?.isCorrect === false ? "#dc2626" : "#b45309" }}>
                              Type: {q.questionType}
                            </span>
                          </div>

                          {q.questionType === "MCQ" ? (
                            <div style={{ fontSize: "0.9rem", color: "#475569", marginTop: "0.5rem" }}>
                              <div><strong>Selected Option:</strong> {ans?.selectedOption || "None"}</div>
                              <div><strong>Correct Key:</strong> {q.correctAnswer}</div>
                              <div style={{ marginTop: "0.25rem", fontWeight: 800, color: ans?.isCorrect ? "#16a34a" : "#dc2626" }}>
                                Auto-graded Marks: {ans?.marksObtained || 0} / {q.marks}
                              </div>
                            </div>
                          ) : (
                            <div style={{ marginTop: "0.5rem" }}>
                              <div style={{ background: "white", padding: "0.85rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontSize: "0.9rem", color: "#0f172a", marginBottom: "0.75rem" }}>
                                <strong>Student Written Response:</strong>
                                <p style={{ marginTop: "0.35rem", whiteSpace: "pre-wrap" }}>{ans?.writtenAnswer || "No response submitted."}</p>
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <label style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1e293b" }}>Assign Marks (Max {q.marks}):</label>
                                <input
                                  type="number"
                                  min={0}
                                  max={q.marks}
                                  step={0.5}
                                  value={manualMarks[q.id] ?? (ans?.marksObtained ?? 0)}
                                  onChange={(e) => setManualMarks({ ...manualMarks, [q.id]: Number(e.target.value) })}
                                  className="input-field"
                                  style={{ width: "100px", padding: "0.4rem 0.75rem" }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Teacher Feedback input */}
                <div style={{ marginBottom: "2rem" }}>
                  <label className="input-label" style={{ fontWeight: 800 }}>Teacher Feedback & Review Comments</label>
                  <textarea
                    rows={3}
                    placeholder="Provide constructive feedback for the student..."
                    value={teacherFeedback}
                    onChange={(e) => setTeacherFeedback(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                  <button onClick={() => setSelectedSubmission(null)} className="btn btn-outline" style={{ borderRadius: "0.75rem" }}>
                    Cancel
                  </button>
                  <button onClick={handleSaveGrades} disabled={isSaving} className="btn btn-primary" style={{ borderRadius: "0.75rem" }}>
                    <Save size={16} /> {isSaving ? "Saving Grades..." : "Save Grades & Publish Result"}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

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
