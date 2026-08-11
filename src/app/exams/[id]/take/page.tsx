"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getExamWithQuestionsAction, startStudentExamSubmissionAction, submitExamAnswersAction } from "@/app/actions/examActions";
import { getAuthSessionAction } from "@/app/actions/authActions";
import ExamTimer from "@/app/components/ExamTimer";
import MediaViewerModal from "@/app/components/MediaViewerModal";
import { AlertCircle, Clock, Send, User, Mail, Phone, Lock, FileText, Upload, FileCheck, Image as ImageIcon, XCircle, Trash2, CheckCircle2, Maximize2, Download } from "lucide-react";

export default function TakeExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: examId } = use(params);
  const router = useRouter();

  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [studentInfo, setStudentInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isStarted, setIsStarted] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [submissionStartTime, setSubmissionStartTime] = useState<string | null>(null);
  const [alreadyAttempted, setAlreadyAttempted] = useState(false);

  // MCQ & Text Answers state
  const [answers, setAnswers] = useState<Record<string, { selectedOption?: string; writtenAnswer?: string }>>({});

  // Multiple Student Answer File Uploads (Multiple Pictures/PDFs)
  const [uploadingAnswerFile, setUploadingAnswerFile] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTimeExpired, setIsTimeExpired] = useState(false);

  // Fullscreen Lightbox state
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = useState("");

  useEffect(() => {
    async function loadExam() {
      const authRes = await getAuthSessionAction();
      if (authRes.isLoggedIn && authRes.user) {
        setStudentInfo((prev) => ({
          ...prev,
          name: authRes.user.name || "",
          email: authRes.user.email || "",
        }));
      }

      const res = await getExamWithQuestionsAction(examId);
      if (res.success && res.exam) {
        setExam(res.exam);
      } else {
        setError(res.error || "Failed to load exam details.");
      }
      setLoading(false);
    }
    loadExam();
  }, [examId]);

  const openFullscreen = (url: string, title: string) => {
    setViewerUrl(url);
    setViewerTitle(title);
  };

  const handleMultipleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (isTimeExpired) {
      alert("Exam time has expired! You cannot upload files after the timer ends.");
      return;
    }

    setUploadingAnswerFile(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const data = new FormData();
      data.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: data,
        });
        const result = await res.json();
        if (result.success && result.url) {
          setUploadedFiles((prev) => [...prev, result.url]);
        }
      } catch (err: any) {
        console.error("Upload error:", err);
      }
    }
    setUploadingAnswerFile(false);
  };

  const handleRemoveFile = (urlToRemove: string) => {
    setUploadedFiles((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const handleStartExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentInfo.name.trim()) {
      alert("Please enter your full name to begin.");
      return;
    }

    setLoading(true);
    const res = await startStudentExamSubmissionAction(examId, studentInfo);
    if (res.success && res.submissionId && res.startTime) {
      setSubmissionId(res.submissionId);
      setSubmissionStartTime(new Date(res.startTime).toISOString());
      setIsStarted(true);
    } else if (res.alreadyCompleted) {
      setAlreadyAttempted(true);
      setSubmissionId(res.submissionId || null);
      setError(res.error || "Attempt limit reached.");
    } else {
      setError(res.error || "Could not start exam.");
    }
    setLoading(false);
  };

  const handleOptionSelect = (questionId: string, optionText: string) => {
    if (isTimeExpired) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selectedOption: optionText,
      },
    }));
  };

  const handleTextChange = (questionId: string, text: string) => {
    if (isTimeExpired) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        writtenAnswer: text,
      },
    }));
  };

  const handleSubmitPaper = async () => {
    if (!submissionId || isSubmitting || isTimeExpired) return;

    const confirmSubmit = window.confirm("Are you sure you want to submit your answer paper now?");
    if (!confirmSubmit) return;

    executeSubmission();
  };

  const executeSubmission = async () => {
    if (!submissionId || isSubmitting) return;
    setIsSubmitting(true);

    const res = await submitExamAnswersAction({
      submissionId,
      answersMap: answers,
      answerFiles: uploadedFiles,
    });

    if (res.success) {
      router.push(`/exams/${examId}/result/${submissionId}`);
    } else {
      if (res.isExpired) {
        setIsTimeExpired(true);
        setError("Exam time limit has expired! Submissions after the countdown timer ends are strictly prohibited.");
      } else {
        alert("Error submitting exam: " + (res.error || "Please try again."));
      }
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <div style={{ textAlign: "center" }}>
          <div className="animate-spin" style={{ width: "42px", height: "42px", border: "4px solid #cbd5e1", borderTopColor: "#4f46e5", borderRadius: "50%", margin: "0 auto 1rem auto" }}></div>
          <p style={{ color: "#64748b", fontWeight: 600 }}>Loading Exam Room Environment...</p>
        </div>
      </div>
    );
  }

  if (alreadyAttempted && submissionId) {
    return (
      <div className="container" style={{ paddingTop: "5rem", paddingBottom: "5rem" }}>
        <div className="glass-panel" style={{ background: "#f0fdf4", border: "2px solid #22c55e", padding: "3rem 2rem", borderRadius: "1.5rem", textAlign: "center" }}>
          <CheckCircle2 size={56} color="#16a34a" style={{ margin: "0 auto 1.25rem auto" }} />
          <h2 style={{ color: "#166534", marginBottom: "0.5rem", fontWeight: 800, fontSize: "1.8rem" }}>
            Attempt Limit Reached (1/1 Attempt Used)
          </h2>
          <p style={{ color: "#15803d", marginBottom: "1.75rem", fontSize: "1.05rem" }}>
            You have already completed your one allowed attempt for <strong>{exam?.title}</strong>. Multiple attempts are strictly restricted.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button onClick={() => router.push(`/exams/${examId}/result/${submissionId}`)} className="btn btn-primary" style={{ borderRadius: "0.75rem", padding: "0.8rem 1.5rem" }}>
              View Your Score & Result Paper
            </button>
            <button onClick={() => router.push("/exams")} className="btn btn-outline" style={{ borderRadius: "0.75rem", padding: "0.8rem 1.5rem" }}>
              Return to Exams Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="container" style={{ paddingTop: "5rem", paddingBottom: "5rem" }}>
        <div className="glass-panel" style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "3rem 2rem", borderRadius: "1.5rem", textAlign: "center" }}>
          <AlertCircle size={48} color="#dc2626" style={{ margin: "0 auto 1rem auto" }} />
          <h2 style={{ color: "#991b1b", marginBottom: "0.5rem", fontWeight: 800 }}>Exam Session Unavailable</h2>
          <p style={{ color: "#7f1d1d", marginBottom: "1.75rem" }}>{error || "Exam not found"}</p>
          <button onClick={() => router.push("/exams")} className="btn btn-primary" style={{ borderRadius: "0.75rem" }}>
            Return to Exams Portal
          </button>
        </div>
      </div>
    );
  }

  // Pre-start verification screen
  if (!isStarted) {
    return (
      <div style={{ minHeight: "100vh", padding: "4rem 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="container" style={{ maxWidth: "660px" }}>
          <div className="glass-panel" style={{ background: "white", padding: 0, borderRadius: "1.5rem", overflow: "hidden" }}>
            <div className="hero-gradient" style={{ padding: "2.5rem 2rem", color: "white" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(129, 140, 248, 0.2)", color: "#a5b4fc", padding: "0.35rem 0.85rem", borderRadius: "9999px", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                <Lock size={14} /> One Attempt Rule Enforced ({exam.category === "CQ" ? "CQ Written Exam" : "MCQ Exam"})
              </div>
              <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "white", marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
                {exam.title}
              </h1>
              <p style={{ color: "#cbd5e1", fontSize: "0.95rem", lineHeight: 1.5 }}>
                {exam.description || "Official Student Examination Portal"}
              </p>
            </div>

            <div style={{ padding: "2.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", background: "#f8fafc", padding: "1.25rem", borderRadius: "1rem", marginBottom: "2rem", textAlign: "center", border: "1px solid #f1f5f9" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>DURATION</span>
                  <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#4f46e5", display: "block" }}>{exam.durationMinutes} Mins</span>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>TYPE</span>
                  <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", display: "block" }}>{exam.category === "CQ" ? "📄 CQ Written" : "⚡ MCQ"}</span>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>ATTEMPTS</span>
                  <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#16a34a", display: "block" }}>1 Attempt Only</span>
                </div>
              </div>

              <form onSubmit={handleStartExam}>
                <div style={{ marginBottom: "1.25rem" }}>
                  <label className="input-label">Student Full Name *</label>
                  <div style={{ position: "relative" }}>
                    <User size={18} color="#94a3b8" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={studentInfo.name}
                      onChange={(e) => setStudentInfo({ ...studentInfo, name: e.target.value })}
                      className="input-field"
                      style={{ paddingLeft: "2.75rem" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "1.25rem" }}>
                  <label className="input-label">Student Email Address (Optional)</label>
                  <div style={{ position: "relative" }}>
                    <Mail size={18} color="#94a3b8" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="email"
                      placeholder="e.g. student@university.edu"
                      value={studentInfo.email}
                      onChange={(e) => setStudentInfo({ ...studentInfo, email: e.target.value })}
                      className="input-field"
                      style={{ paddingLeft: "2.75rem" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "2rem" }}>
                  <label className="input-label">Student ID / Phone Number (Optional)</label>
                  <div style={{ position: "relative" }}>
                    <Phone size={18} color="#94a3b8" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="text"
                      placeholder="e.g. 01700000000"
                      value={studentInfo.phone}
                      onChange={(e) => setStudentInfo({ ...studentInfo, phone: e.target.value })}
                      className="input-field"
                      style={{ paddingLeft: "2.75rem" }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "0.95rem", fontSize: "1.05rem", fontWeight: 800, borderRadius: "0.85rem" }}
                >
                  Start Exam Attempt <Clock size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div style={{ backgroundColor: "#0b0f19", color: "#f8fafc", minHeight: "100vh", paddingBottom: "6rem" }}>
      {/* Sticky Top Timer Banner */}
      <div style={{
        background: "rgba(11, 15, 25, 0.92)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        position: "sticky",
        top: 0,
        zIndex: 40,
        padding: "0.85rem 0"
      }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "white", letterSpacing: "-0.01em" }}>
              {exam.title} ({exam.category === "CQ" ? "📄 CQ Written Paper" : "⚡ MCQ Exam"})
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              Student: <strong style={{ color: "#818cf8" }}>{studentInfo.name}</strong> • Progress: <strong style={{ color: "#38bdf8" }}>{answeredCount} / {exam.questions.length || 1}</strong>
            </p>
          </div>
          {submissionStartTime && (
            <ExamTimer
              startTime={submissionStartTime}
              durationMinutes={exam.durationMinutes}
              onTimeUp={() => {
                setIsTimeExpired(true);
                alert("Time is up! Exam timer expired. Attempting automatic paper submission...");
                executeSubmission();
              }}
            />
          )}
        </div>
      </div>

      <div className="container" style={{ maxWidth: "880px", paddingTop: "2.5rem" }}>
        
        {/* CQ Question Attachment View (If Admin Uploaded Question PDF/Image) */}
        {exam.category === "CQ" && (
          <div className="glass-panel-dark" style={{ padding: "2rem", marginBottom: "2rem", border: "1px solid #6366f1" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#818cf8", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FileText size={22} /> Creative Question Paper (CQ)
              </h3>

              {exam.questionFileUrl && (
                <div style={{ display: "flex", gap: "0.6rem" }}>
                  <button
                    type="button"
                    onClick={() => openFullscreen(exam.questionFileUrl, exam.title + " - Question Paper")}
                    className="btn btn-outline"
                    style={{ background: "white", color: "#0f172a", fontSize: "0.85rem", padding: "0.4rem 0.85rem" }}
                  >
                    <Maximize2 size={14} /> Fullscreen View
                  </button>
                  <a
                    href={exam.questionFileUrl}
                    download
                    className="btn btn-primary"
                    style={{ fontSize: "0.85rem", padding: "0.4rem 0.85rem" }}
                  >
                    <Download size={14} /> Download Question
                  </a>
                </div>
              )}
            </div>

            {exam.questionFileUrl ? (
              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "0.85rem", padding: "1rem", overflow: "hidden" }}>
                {exam.questionFileType === "pdf" ? (
                  <div>
                    <iframe
                      src={exam.questionFileUrl}
                      style={{ width: "100%", height: "550px", border: "none", borderRadius: "0.75rem" }}
                      title="Question Paper PDF"
                    />
                  </div>
                ) : (
                  <div>
                    <img
                      src={exam.questionFileUrl}
                      alt="Question Paper"
                      style={{ width: "100%", height: "auto", maxHeight: "600px", objectFit: "contain", borderRadius: "0.75rem" }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: "#94a3b8" }}>{exam.description || "Read the question below and submit your written response or upload answer PDF/photo."}</p>
            )}
          </div>
        )}

        {/* MCQ & Text Questions List */}
        {exam.questions.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
            {exam.questions.map((q: any, idx: number) => {
              let optionsList: string[] = [];
              if (q.questionType === "MCQ" && q.options) {
                try {
                  optionsList = JSON.parse(q.options);
                } catch (e) {
                  optionsList = [];
                }
              }

              const currentAns = answers[q.id] || {};
              const isAnswered = currentAns.selectedOption || currentAns.writtenAnswer;

              return (
                <div
                  key={q.id}
                  className="glass-panel-dark"
                  style={{
                    padding: "2rem",
                    border: isAnswered ? "1px solid #6366f1" : "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: isAnswered ? "0 10px 30px -5px rgba(99, 102, 241, 0.2)" : "0 10px 25px rgba(0, 0, 0, 0.3)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#38bdf8", background: "rgba(56, 189, 248, 0.12)", padding: "0.3rem 0.75rem", borderRadius: "0.5rem", border: "1px solid rgba(56, 189, 248, 0.2)" }}>
                      Question {idx + 1} of {exam.questions.length}
                    </span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#cbd5e1" }}>
                      {q.marks} Marks
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#f8fafc", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                    {q.questionText}
                  </h3>

                  {/* MCQ Choices */}
                  {q.questionType === "MCQ" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                      {optionsList.map((opt, optIdx) => {
                        const isSelected = currentAns.selectedOption === opt;
                        return (
                          <label
                            key={optIdx}
                            onClick={() => handleOptionSelect(q.id, opt)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.95rem",
                              padding: "1rem 1.25rem",
                              borderRadius: "0.85rem",
                              background: isSelected ? "rgba(99, 102, 241, 0.22)" : "rgba(255, 255, 255, 0.03)",
                              border: isSelected ? "2px solid #818cf8" : "1px solid rgba(255, 255, 255, 0.08)",
                              cursor: isTimeExpired ? "not-allowed" : "pointer",
                              transition: "all 0.2s ease"
                            }}
                          >
                            <input
                              type="radio"
                              disabled={isTimeExpired}
                              name={`q_${q.id}`}
                              checked={isSelected}
                              onChange={() => handleOptionSelect(q.id, opt)}
                              style={{ width: "20px", height: "20px", accentColor: "#818cf8" }}
                            />
                            <span style={{ color: isSelected ? "#a5b4fc" : "#e2e8f0", fontSize: "1rem", fontWeight: isSelected ? 700 : 400 }}>
                              {opt}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* TEXT / Written Question */}
                  {q.questionType === "TEXT" && (
                    <div>
                      <textarea
                        rows={5}
                        disabled={isTimeExpired}
                        placeholder="Write your answer paper response clearly here..."
                        value={currentAns.writtenAnswer || ""}
                        onChange={(e) => handleTextChange(q.id, e.target.value)}
                        className="input-field"
                        style={{
                          background: "rgba(15, 23, 42, 0.8)",
                          color: "#f8fafc",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          borderRadius: "0.85rem",
                          padding: "1.1rem",
                          fontSize: "0.95rem",
                          lineHeight: 1.6
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* MULTIPLE PICTURES & FILE UPLOADS FOR CQ EXAMS */}
        {exam.category === "CQ" && (
          <div className="glass-panel-dark" style={{ padding: "2rem", marginTop: "2rem", border: "1px solid #10b981" }}>
            <h4 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#34d399", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Upload size={20} /> Upload Answer Paper Photos & Files (Multiple Pictures Allowed)
            </h4>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
              Take photos of your written answer pages or save them as PDFs. You can attach <strong>multiple pictures</strong> before submitting.
            </p>

            <input
              type="file"
              multiple
              disabled={isTimeExpired}
              accept="image/*,application/pdf"
              onChange={handleMultipleFileUpload}
              style={{ color: "#f8fafc", marginBottom: "1rem", cursor: isTimeExpired ? "not-allowed" : "pointer" }}
            />
            {uploadingAnswerFile && <p style={{ fontSize: "0.85rem", color: "#60a5fa", marginBottom: "1rem" }}>Uploading picture(s)...</p>}

            {/* List of Uploaded Pictures */}
            {uploadedFiles.length > 0 && (
              <div>
                <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#34d399", display: "block", marginBottom: "0.75rem" }}>
                  Attached Pictures ({uploadedFiles.length} File(s)):
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.85rem" }}>
                  {uploadedFiles.map((fileUrl, index) => {
                    const isPdf = fileUrl.toLowerCase().endsWith(".pdf");
                    return (
                      <div
                        key={index}
                        style={{
                          position: "relative",
                          background: "rgba(255, 255, 255, 0.06)",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          borderRadius: "0.75rem",
                          padding: "0.5rem",
                          textAlign: "center"
                        }}
                      >
                        {isPdf ? (
                          <div style={{ padding: "0.75rem 0", color: "#60a5fa", fontWeight: 700, fontSize: "0.8rem" }}>
                            📄 PDF Page {index + 1}
                          </div>
                        ) : (
                          <img
                            src={fileUrl}
                            alt={`Answer Photo ${index + 1}`}
                            style={{ width: "100%", height: "90px", objectFit: "cover", borderRadius: "0.5rem" }}
                            onClick={() => openFullscreen(fileUrl, `Uploaded Photo #${index + 1}`)}
                          />
                        )}

                        <div style={{ display: "flex", justifyContent: "center", gap: "0.3rem", marginTop: "0.35rem" }}>
                          <button
                            type="button"
                            onClick={() => openFullscreen(fileUrl, `Uploaded Photo #${index + 1}`)}
                            style={{ background: "rgba(99, 102, 241, 0.6)", color: "white", border: "none", borderRadius: "0.4rem", padding: "0.2rem 0.4rem", fontSize: "0.7rem", cursor: "pointer" }}
                          >
                            <Maximize2 size={11} /> View
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveFile(fileUrl)}
                            style={{
                              background: "rgba(220, 38, 38, 0.85)",
                              color: "white",
                              border: "none",
                              borderRadius: "0.4rem",
                              padding: "0.2rem 0.4rem",
                              fontSize: "0.7rem",
                              cursor: "pointer"
                            }}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit Paper Floating Footer */}
        <div style={{
          marginTop: "3rem",
          background: isTimeExpired ? "rgba(127, 29, 29, 0.95)" : "rgba(30, 41, 59, 0.95)",
          padding: "1.75rem 2.25rem",
          borderRadius: "1.25rem",
          border: isTimeExpired ? "1px solid #ef4444" : "1px solid rgba(255, 255, 255, 0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1.25rem",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
        }}>
          <div>
            <h4 style={{ color: "white", fontSize: "1.2rem", fontWeight: 800 }}>
              {isTimeExpired ? "❌ Exam Time Has Ended" : "Completed Your Assessment?"}
            </h4>
            <p style={{ color: isTimeExpired ? "#fca5a5" : "#94a3b8", fontSize: "0.9rem" }}>
              {isTimeExpired
                ? "The countdown timer has expired. Submissions after the deadline are locked."
                : "Double check your choices or uploaded pictures before submitting your final answer paper."}
            </p>
          </div>

          {!isTimeExpired ? (
            <button
              onClick={handleSubmitPaper}
              disabled={isSubmitting || isTimeExpired}
              className="btn btn-primary"
              style={{
                padding: "0.95rem 2.25rem",
                fontSize: "1.05rem",
                fontWeight: 800,
                borderRadius: "0.85rem"
              }}
            >
              {isSubmitting ? "Submitting Answer Paper..." : "Submit Answer Paper"} <Send size={18} />
            </button>
          ) : (
            <button
              disabled
              className="btn"
              style={{
                padding: "0.95rem 2.25rem",
                fontSize: "1.05rem",
                fontWeight: 800,
                borderRadius: "0.85rem",
                background: "#991b1b",
                color: "#fecaca",
                cursor: "not-allowed"
              }}
            >
              Submissions Closed <XCircle size={18} />
            </button>
          )}
        </div>

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
