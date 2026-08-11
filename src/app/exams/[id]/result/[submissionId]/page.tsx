"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getSubmissionDetailsAction } from "@/app/actions/examActions";
import MediaViewerModal from "@/app/components/MediaViewerModal";
import { CheckCircle, XCircle, Award, ArrowLeft, MessageSquare, FileText, Download, Maximize2, ExternalLink } from "lucide-react";

export default function ExamResultPage({
  params,
}: {
  params: Promise<{ id: string; submissionId: string }>;
}) {
  const { id: examId, submissionId } = use(params);
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fullscreen Lightbox state
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = useState("");

  useEffect(() => {
    async function loadResult() {
      const res = await getSubmissionDetailsAction(submissionId);
      if (res.success && res.submission) {
        setSubmission(res.submission);
      }
      setLoading(false);
    }
    loadResult();
  }, [submissionId]);

  const openFullscreen = (url: string, title: string) => {
    setViewerUrl(url);
    setViewerTitle(title);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "6rem 0" }}>
        <div className="animate-spin" style={{ width: "42px", height: "42px", border: "4px solid #cbd5e1", borderTopColor: "#4f46e5", borderRadius: "50%", margin: "0 auto 1rem auto" }}></div>
        <p style={{ color: "#64748b", fontWeight: 600 }}>Loading Exam Result & Answer Paper...</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="container" style={{ padding: "4rem 0" }}>
        <div className="glass-panel" style={{ background: "#fef2f2", padding: "2rem", borderRadius: "1rem", textAlign: "center" }}>
          <h2>Result Not Found</h2>
          <p>Could not load submission details.</p>
          <Link href="/exams" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Back to Exams
          </Link>
        </div>
      </div>
    );
  }

  const exam = submission.exam;
  const isPassed = (submission.totalScore || 0) >= exam.passMarks;
  const isGraded = submission.status === "GRADED";
  const isExpired = submission.status === "TIME_EXPIRED";

  const startMs = new Date(submission.startTime).getTime();
  const endMs = submission.submittedAt ? new Date(submission.submittedAt).getTime() : Date.now();
  const minutesTaken = Math.max(1, Math.round((endMs - startMs) / (1000 * 60)));

  let fileList: string[] = [];
  if (submission.answerFiles) {
    try {
      fileList = JSON.parse(submission.answerFiles);
    } catch (e) {
      fileList = submission.answerFileUrl ? [submission.answerFileUrl] : [];
    }
  } else if (submission.answerFileUrl) {
    fileList = [submission.answerFileUrl];
  }

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "3rem 0" }}>
      <div className="container" style={{ maxWidth: "840px" }}>
        <Link href="/exams" className="nav-link" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginBottom: "1.5rem", fontWeight: 600, color: "#64748b" }}>
          <ArrowLeft size={16} /> Back to All Exams
        </Link>

        {/* Score Card */}
        <div
          className="glass-panel"
          style={{
            background: "white",
            borderRadius: "1.5rem",
            padding: "2.5rem",
            marginBottom: "2rem",
            textAlign: "center",
          }}
        >
          <div style={{ display: "inline-flex", padding: "1rem", borderRadius: "50%", background: isPassed ? "#dcfce7" : "#fee2e2", marginBottom: "1rem" }}>
            <Award size={48} color={isPassed ? "#166534" : "#dc2626"} />
          </div>

          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.25rem" }}>
            {exam.title} ({exam.category === "CQ" ? "📄 CQ Creative Paper" : "⚡ MCQ Exam"})
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
            Student: <strong style={{ color: "#0f172a" }}>{submission.studentName}</strong>
          </p>

          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: isGraded ? (isPassed ? "#dcfce7" : "#fee2e2") : isExpired ? "#fee2e2" : "#fef3c7",
            color: isGraded ? (isPassed ? "#166534" : "#991b1b") : isExpired ? "#dc2626" : "#b45309",
            padding: "0.45rem 1.35rem",
            borderRadius: "9999px",
            fontWeight: 800,
            fontSize: "0.9rem",
            marginBottom: "2rem"
          }}>
            {isGraded ? (isPassed ? "PASSED ASSESSMENT" : "NEEDS IMPROVEMENT") : isExpired ? "TIMER EXPIRED — SUBMISSIONS LOCKED" : "UNDER TEACHER REVIEW"}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", background: "#f8fafc", padding: "1.5rem", borderRadius: "1rem", border: "1px solid #f1f5f9" }}>
            <div>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>YOUR SCORE</span>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: isPassed ? "#16a34a" : "#dc2626" }}>
                {submission.totalScore ?? 0} <span style={{ fontSize: "1rem", color: "#94a3b8" }}>/ {exam.totalMarks}</span>
              </div>
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>PASS MARK</span>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a" }}>
                {exam.passMarks}
              </div>
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>TIME TAKEN</span>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a" }}>
                {minutesTaken} <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>Mins</span>
              </div>
            </div>
          </div>

          {/* Teacher Feedback Banner */}
          {submission.feedback && (
            <div style={{ marginTop: "1.75rem", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "1.25rem", borderRadius: "0.85rem", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#1d4ed8", fontWeight: 800, marginBottom: "0.35rem" }}>
                <MessageSquare size={18} /> Teacher Feedback
              </div>
              <p style={{ color: "#1e3a8a", fontSize: "0.95rem" }}>{submission.feedback}</p>
            </div>
          )}
        </div>

        {/* Uploaded Multiple Answer Picture Files View with Fullscreen & Download */}
        {fileList.length > 0 && (
          <div className="glass-panel" style={{ background: "white", padding: "2rem", borderRadius: "1.25rem", marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FileText size={20} color="#4f46e5" /> Submitted Answer Paper Pictures ({fileList.length} File(s))
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "1.25rem" }}>
              {fileList.map((fileUrl, index) => {
                const isPdf = fileUrl.toLowerCase().endsWith(".pdf");
                return (
                  <div key={index} style={{ border: "1px solid #e2e8f0", borderRadius: "0.85rem", padding: "0.85rem", background: "#f8fafc", textAlign: "center" }}>
                    {isPdf ? (
                      <div style={{ padding: "1.5rem 0" }}>
                        <FileText size={40} color="#2563eb" style={{ margin: "0 auto 0.5rem auto" }} />
                        <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", display: "block", marginBottom: "0.75rem" }}>
                          Answer PDF Page #{index + 1}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <img
                          src={fileUrl}
                          alt={`Answer Photo Page ${index + 1}`}
                          style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "0.6rem", marginBottom: "0.75rem", cursor: "pointer" }}
                          onClick={() => openFullscreen(fileUrl, `Answer Photo #${index + 1}`)}
                        />
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={() => openFullscreen(fileUrl, `Answer Paper File #${index + 1}`)}
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
          </div>
        )}

        {/* Detailed Question Review */}
        {exam.questions.length > 0 && (
          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", marginBottom: "1.25rem" }}>
              Question Breakdown & Answer Details
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {exam.questions.map((q: any, idx: number) => {
                const studentAns = submission.answers.find((a: any) => a.questionId === q.id);
                const isCorrect = studentAns?.isCorrect;

                return (
                  <div
                    key={q.id}
                    className="glass-panel"
                    style={{
                      background: "white",
                      borderRadius: "1rem",
                      padding: "1.5rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#475569" }}>
                        Q{idx + 1}. {q.questionText}
                      </span>
                      <span style={{ fontSize: "0.85rem", fontWeight: 800, color: isCorrect ? "#16a34a" : isCorrect === false ? "#dc2626" : "#b45309" }}>
                        {studentAns?.marksObtained ?? 0} / {q.marks} Marks
                      </span>
                    </div>

                    {q.questionType === "MCQ" ? (
                      <div style={{ fontSize: "0.9rem", marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: isCorrect ? "#166534" : "#991b1b" }}>
                          {isCorrect ? <CheckCircle size={16} /> : <XCircle size={16} />}
                          <span><strong>Your Answer:</strong> {studentAns?.selectedOption || "No option selected"}</span>
                        </div>
                        {!isCorrect && q.correctAnswer && (
                          <div style={{ color: "#166534", marginLeft: "1.5rem" }}>
                            <strong>Correct Answer:</strong> {q.correctAnswer}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ marginTop: "0.75rem", background: "#f8fafc", padding: "0.85rem", borderRadius: "0.5rem", fontSize: "0.9rem" }}>
                        <span style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#64748b", marginBottom: "0.25rem" }}>
                          SUBMITTED WRITTEN RESPONSE:
                        </span>
                        <p style={{ color: "#334155", fontStyle: studentAns?.writtenAnswer ? "normal" : "italic" }}>
                          {studentAns?.writtenAnswer || "No text response submitted."}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
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
