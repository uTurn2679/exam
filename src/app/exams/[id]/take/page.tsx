"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getExamWithQuestionsAction, startStudentExamSubmissionAction, submitExamAnswersAction } from "@/app/actions/examActions";
import { getAuthSessionAction, getUserProfileAction } from "@/app/actions/authActions";
import ExamTimer from "@/app/components/ExamTimer";
import MediaViewerModal from "@/app/components/MediaViewerModal";
import { AlertCircle, Clock, Send, Lock, FileText, Upload, FileCheck, Image as ImageIcon, XCircle, Trash2, CheckCircle2, Maximize2, Download, ArrowRight, UserCheck, Images } from "lucide-react";
import Link from "next/link";

export default function TakeExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: examId } = use(params);
  const router = useRouter();

  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userInfo, setUserInfo] = useState<{ name: string; phone?: string }>({ name: "" });

  const [isStarted, setIsStarted] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [submissionStartTime, setSubmissionStartTime] = useState<string | null>(null);
  const [alreadyAttempted, setAlreadyAttempted] = useState(false);

  // MCQ & Text Answers state
  const [answers, setAnswers] = useState<Record<string, { selectedOption?: string; writtenAnswer?: string }>>({});

  // Multiple Student Answer File Uploads (Supports 20+ Photos/PDFs)
  const [uploadingAnswerFile, setUploadingAnswerFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Submission loading & live percentage progress
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPercent, setSubmitPercent] = useState<number>(0);
  const [isTimeExpired, setIsTimeExpired] = useState(false);

  // Fullscreen Lightbox state
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = useState("");

  useEffect(() => {
    async function initExamSession() {
      setLoading(true);
      
      // 1. Check Authentication Status
      const authRes = await getAuthSessionAction();
      if (!authRes.isLoggedIn || !authRes.user) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);

      // 2. Fetch User Profile Info automatically (No forms required!)
      const profileRes = await getUserProfileAction();
      const studentName = profileRes.user?.name || authRes.user.name || "Student";
      const studentPhone = profileRes.user?.phone || "";
      setUserInfo({ name: studentName, phone: studentPhone });

      // 3. Load Exam Paper Details
      const examRes = await getExamWithQuestionsAction(examId);
      if (examRes.success && examRes.exam) {
        setExam(examRes.exam);

        // 4. Automatically start/resume submission session using profile credentials!
        const subRes = await startStudentExamSubmissionAction(examId, { name: studentName, phone: studentPhone });
        if (subRes.success && subRes.submissionId && subRes.startTime) {
          setSubmissionId(subRes.submissionId);
          setSubmissionStartTime(new Date(subRes.startTime).toISOString());
          setIsStarted(true);
        } else if (subRes.alreadyCompleted) {
          setAlreadyAttempted(true);
          setSubmissionId(subRes.submissionId || null);
          setError(subRes.error || "Attempt limit reached.");
        } else {
          setError(subRes.error || "Could not start exam session.");
        }
      } else {
        setError(examRes.error || "Failed to load exam details.");
      }

      setLoading(false);
    }

    initExamSession();
  }, [examId]);

  const openFullscreen = (url: string, title: string) => {
    setViewerUrl(url);
    setViewerTitle(title);
  };

  // Fast & Sharp Image Compressor (1000px max dimension, 0.65 quality -> ~100KB per photo)
  const compressImageIfNeeded = async (file: File): Promise<File> => {
    const isImg = file.type.startsWith("image/") || !!file.name.match(/\.(jpg|jpeg|png|webp|heic|heif)$/i);
    if (!isImg) return file;

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDim = 1000; // 1000px keeps handwritten text crisp while producing ~100KB files

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                    type: "image/jpeg",
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                } else {
                  resolve(file);
                }
              },
              "image/jpeg",
              0.65
            );
          } else {
            resolve(file);
          }
        };
        img.onerror = () => resolve(file);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  const handleMultipleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (isTimeExpired) {
      alert("Exam time has expired! You cannot upload files after the timer ends.");
      return;
    }

    setUploadingAnswerFile(true);
    setUploadProgress({ current: 0, total: files.length });

    for (let i = 0; i < files.length; i++) {
      setUploadProgress({ current: i + 1, total: files.length });
      const rawFile = files[i];
      try {
        const fileToUpload = await compressImageIfNeeded(rawFile);
        const data = new FormData();
        data.append("file", fileToUpload);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: data,
        });
        const result = await res.json();
        if (result.success && result.url) {
          setUploadedFiles((prev) => [...prev, result.url]);
        } else {
          alert(`Failed to upload ${rawFile.name}: ${result.error || "Upload error"}`);
        }
      } catch (err: any) {
        console.error("Upload error:", err);
        alert(`Error uploading ${rawFile.name}: ${err?.message || "Connection error"}`);
      }
    }

    setUploadingAnswerFile(false);
    setUploadProgress(null);
  };

  const handleRemoveFile = (urlToRemove: string) => {
    setUploadedFiles((prev) => prev.filter((url) => url !== urlToRemove));
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

    const confirmSubmit = window.confirm(`Are you sure you want to submit your answer paper (${uploadedFiles.length} photo page(s) attached)?`);
    if (!confirmSubmit) return;

    executeSubmission();
  };

  const executeSubmission = async () => {
    if (!submissionId || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitPercent(10);

    // Live progress simulation timer while submitting server action
    const progressTimer = setInterval(() => {
      setSubmitPercent((prev) => {
        if (prev >= 94) return 94;
        return prev + Math.floor(Math.random() * 12) + 8;
      });
    }, 200);

    try {
      const res = await submitExamAnswersAction({
        submissionId,
        answersMap: answers,
        answerFiles: uploadedFiles,
      });

      clearInterval(progressTimer);

      if (res.success) {
        setSubmitPercent(100);
        setTimeout(() => {
          router.push(`/exams/${examId}/result/${submissionId}`);
        }, 350);
      } else {
        if (res.isExpired) {
          setIsTimeExpired(true);
          setError("Exam time limit has expired! Submissions after the countdown timer ends are strictly prohibited.");
        } else {
          alert("Error submitting exam: " + (res.error || "Please try again."));
        }
        setIsSubmitting(false);
        setSubmitPercent(0);
      }
    } catch (err: any) {
      clearInterval(progressTimer);
      alert("Error submitting exam: " + (err?.message || "Please check your network."));
      setIsSubmitting(false);
      setSubmitPercent(0);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <div style={{ textAlign: "center" }}>
          <div className="animate-spin" style={{ width: "42px", height: "42px", border: "4px solid #cbd5e1", borderTopColor: "#4f46e5", borderRadius: "50%", margin: "0 auto 1rem auto" }}></div>
          <p style={{ color: "#64748b", fontWeight: 600 }}>Loading Exam Room & Student Profile...</p>
        </div>
      </div>
    );
  }

  // SIGN IN PROTECTION: Redirect/Prompt signed out users to Sign In
  if (isLoggedIn === false) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 1rem" }}>
        <div className="glass-panel" style={{ maxWidth: "560px", padding: "3rem 2rem", textAlign: "center", borderRadius: "1.5rem" }}>
          <div style={{ background: "#fef2f2", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem auto" }}>
            <Lock size={40} color="#dc2626" />
          </div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>
            Sign In Required
          </h2>
          <p style={{ color: "#64748b", marginBottom: "2rem", fontSize: "1.05rem", lineHeight: 1.6 }}>
            You must be signed in to take an exam session. Your exam attempt and score will automatically be linked to your account.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <Link href="/login" className="btn btn-primary" style={{ padding: "0.85rem 1.75rem" }}>
              Sign In Now <ArrowRight size={18} />
            </Link>
            <Link href="/register" className="btn btn-outline" style={{ padding: "0.85rem 1.5rem" }}>
              Sign Up
            </Link>
          </div>
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

  return (
    <div style={{ minHeight: "100vh", padding: "2.5rem 0", background: "#f8fafc" }}>
      <div className="container" style={{ maxWidth: "1000px" }}>
        
        {/* Sticky Header Bar: Exam Info & Live Timer */}
        <div className="glass-panel" style={{
          position: "sticky",
          top: "4.5rem",
          zIndex: 40,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(16px)",
          padding: "1.25rem 1.75rem",
          borderRadius: "1.25rem",
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.08)",
          border: "1px solid #e2e8f0"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, background: "#e0e7ff", color: "#3730a3", padding: "0.2rem 0.6rem", borderRadius: "0.5rem" }}>
                {exam.category === "CQ" ? "📄 CQ Creative Paper" : "⚡ MCQ Auto-Graded"}
              </span>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, background: "#dcfce7", color: "#15803d", padding: "0.2rem 0.6rem", borderRadius: "0.5rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                <UserCheck size={13} /> Logged in: {userInfo.name}
              </span>
            </div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", marginTop: "0.35rem" }}>
              {exam.title}
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {submissionStartTime && (
              <ExamTimer
                startTime={submissionStartTime}
                durationMinutes={exam.durationMinutes}
                onTimeUp={() => {
                  setIsTimeExpired(true);
                  executeSubmission();
                }}
              />
            )}

            <button
              onClick={handleSubmitPaper}
              disabled={isSubmitting || isTimeExpired}
              className="btn btn-primary"
              style={{
                padding: "0.65rem 1.35rem",
                borderRadius: "0.75rem",
                fontSize: "0.9rem",
                background: isSubmitting ? "#64748b" : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                boxShadow: "0 8px 18px rgba(16, 185, 129, 0.35)"
              }}
            >
              {isSubmitting ? (
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span className="animate-spin">⏳</span> Please wait... ({submitPercent}%)
                </span>
              ) : (
                <>
                  <Send size={16} /> Submit Exam Paper
                </>
              )}
            </button>
          </div>
        </div>

        {/* SECTION 1: CQ CREATIVE ATTACHED QUESTION FILE VIEWER */}
        {exam.category === "CQ" && exam.questionFileUrl && (
          <div className="glass-panel" style={{ background: "white", padding: "1.75rem", borderRadius: "1.25rem", marginBottom: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#4f46e5", textTransform: "uppercase" }}>Question Document</span>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>
                  📄 Attached Question Paper ({exam.questionFileType?.toUpperCase()})
                </h3>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => openFullscreen(exam.questionFileUrl, exam.title + " - Question Paper")}
                  className="btn btn-outline"
                  style={{ fontSize: "0.85rem", padding: "0.45rem 0.85rem" }}
                >
                  <Maximize2 size={15} /> Fullscreen
                </button>
                <a
                  href={exam.questionFileUrl}
                  download
                  className="btn btn-primary"
                  style={{ fontSize: "0.85rem", padding: "0.45rem 0.85rem" }}
                >
                  <Download size={15} /> Download PDF/Photo
                </a>
              </div>
            </div>

            {exam.questionFileType === "pdf" ? (
              <iframe
                src={exam.questionFileUrl}
                style={{ width: "100%", height: "550px", border: "1px solid #cbd5e1", borderRadius: "0.85rem" }}
                title="Question Paper PDF"
              />
            ) : (
              <div style={{ textAlign: "center", background: "#f8fafc", padding: "1rem", borderRadius: "0.85rem", border: "1px solid #e2e8f0" }}>
                <img
                  src={exam.questionFileUrl}
                  alt="Question Paper Attachment"
                  style={{ maxWidth: "100%", maxHeight: "600px", objectFit: "contain", borderRadius: "0.5rem" }}
                />
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: CQ WRITTEN ANSWER UPLOAD AREA (Supports 20+ Photos/PDFs) */}
        {exam.category === "CQ" && (
          <div className="glass-panel" style={{ background: "white", padding: "2rem", borderRadius: "1.25rem", marginBottom: "2rem", border: "2px solid #6366f1" }}>
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "#f5f3ff", color: "#4f46e5", padding: "0.3rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.8rem", fontWeight: 800, marginBottom: "0.5rem" }}>
                <Images size={14} /> Student Answer Script Room (Supports 20+ Photos)
              </div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>
                Upload Your Handwritten Answer Pages (Up to 20+ Photos)
              </h3>
              <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                Take clear photos of your written exam pages on mobile and upload them here. You can select <strong>up to 20+ photos at once</strong> or upload in batches.
              </p>
            </div>

            {/* File Upload Box */}
            <div style={{ background: "#f8fafc", border: "2px dashed #a5b4fc", borderRadius: "1rem", padding: "2rem 1.5rem", textAlign: "center", marginBottom: "1.5rem" }}>
              <Upload size={36} color="#6366f1" style={{ margin: "0 auto 0.75rem auto" }} />
              <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1e293b", marginBottom: "0.35rem" }}>
                Select up to 20+ Answer Photos or PDF File
              </h4>
              <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
                Select multiple pictures from mobile gallery or camera.
              </p>

              <label className="btn btn-primary" style={{ cursor: "pointer", display: "inline-flex", padding: "0.75rem 1.75rem", fontSize: "0.95rem" }}>
                <Images size={18} /> Choose 20+ Answer Photos
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={handleMultipleFileUpload}
                  disabled={uploadingAnswerFile || isTimeExpired}
                  style={{ display: "none" }}
                />
              </label>

              {/* REAL-TIME LIVE UPLOAD PROGRESS INDICATOR */}
              {uploadingAnswerFile && (
                <div style={{ marginTop: "1.25rem", background: "#e0e7ff", color: "#3730a3", padding: "0.75rem 1.25rem", borderRadius: "0.75rem", display: "inline-block", fontWeight: 800, fontSize: "0.9rem", border: "1px solid #c7d2fe" }}>
                  <span className="animate-spin" style={{ display: "inline-block", marginRight: "0.5rem" }}>⏳</span>
                  {uploadProgress ? `Uploading Photo ${uploadProgress.current} of ${uploadProgress.total} (${Math.round((uploadProgress.current / uploadProgress.total) * 100)}%)...` : "Processing 20+ Photos..."}
                </div>
              )}
            </div>

            {/* Uploaded Answer Files Preview Gallery */}
            {uploadedFiles.length > 0 && (
              <div>
                <h4 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <CheckCircle2 size={18} color="#16a34a" /> Uploaded Answer Script Pages ({uploadedFiles.length} Photo(s) Attached):
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedFiles.map((url, idx) => {
                    const isPdf = url.toLowerCase().includes(".pdf") || url.startsWith("data:application/pdf");

                    return (
                      <div
                        key={idx}
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #cbd5e1",
                          borderRadius: "0.75rem",
                          padding: "0.6rem",
                          position: "relative",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center"
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(url)}
                          style={{
                            position: "absolute",
                            top: "0.35rem",
                            right: "0.35rem",
                            background: "#fee2e2",
                            color: "#dc2626",
                            border: "none",
                            borderRadius: "50%",
                            width: "26px",
                            height: "26px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            zIndex: 10
                          }}
                          title="Remove file"
                        >
                          <XCircle size={16} />
                        </button>

                        <div
                          onClick={() => openFullscreen(url, `Answer Page ${idx + 1}`)}
                          style={{ width: "100%", height: "110px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: "0.5rem", background: "white", marginBottom: "0.5rem" }}
                        >
                          {isPdf ? (
                            <div style={{ textAlign: "center", color: "#dc2626" }}>
                              <FileText size={36} />
                              <span style={{ fontSize: "0.75rem", fontWeight: 700, display: "block" }}>PDF Document</span>
                            </div>
                          ) : (
                            <img src={url} alt={`Page ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          )}
                        </div>

                        <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569" }}>
                          Page #{idx + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: MCQ / INDIVIDUAL QUESTION ITEMS LIST */}
        {exam.questions && exam.questions.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>
              Question Paper Items ({exam.questions.length} Items):
            </h3>

            {exam.questions.map((question: any, idx: number) => {
              let parsedOptions: string[] = [];
              if (question.questionType === "MCQ" && question.options) {
                try {
                  parsedOptions = JSON.parse(question.options);
                } catch (e) {
                  parsedOptions = [];
                }
              }

              const currentAns = answers[question.id];

              return (
                <div
                  key={question.id}
                  className="glass-panel"
                  style={{ background: "white", padding: "1.75rem", borderRadius: "1.25rem", border: "1px solid #e2e8f0" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.85rem" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 800, background: "#f5f3ff", color: "#4f46e5", padding: "0.3rem 0.75rem", borderRadius: "0.5rem" }}>
                      Question #{idx + 1} • {question.marks} Marks
                    </span>
                  </div>

                  <h4 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: "1.1rem" }}>
                    {question.questionText}
                  </h4>

                  {/* MCQ Options */}
                  {question.questionType === "MCQ" ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem" }}>
                      {parsedOptions.map((opt, oIdx) => {
                        const isSelected = currentAns?.selectedOption === opt;
                        return (
                          <label
                            key={oIdx}
                            onClick={() => handleOptionSelect(question.id, opt)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.85rem",
                              padding: "0.9rem 1.25rem",
                              borderRadius: "0.85rem",
                              border: isSelected ? "2px solid #4f46e5" : "1px solid #e2e8f0",
                              background: isSelected ? "#f5f3ff" : "#f8fafc",
                              color: isSelected ? "#3730a3" : "#334155",
                              fontWeight: isSelected ? 800 : 500,
                              cursor: "pointer",
                              transition: "all 0.2s ease"
                            }}
                          >
                            <input
                              type="radio"
                              name={`q_${question.id}`}
                              checked={isSelected}
                              onChange={() => {}}
                              style={{ width: "18px", height: "18px", accentColor: "#4f46e5" }}
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    /* Written Answer Textarea */
                    <div>
                      <label className="input-label">Type your written answer response here:</label>
                      <textarea
                        rows={4}
                        placeholder="Write your explanation or essay response..."
                        value={currentAns?.writtenAnswer || ""}
                        onChange={(e) => handleTextChange(question.id, e.target.value)}
                        disabled={isTimeExpired}
                        className="input-field"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* BOTTOM SUBMIT BAR */}
        <div style={{ marginTop: "3rem", textAlign: "center" }}>
          <button
            onClick={handleSubmitPaper}
            disabled={isSubmitting || isTimeExpired}
            className="btn btn-primary"
            style={{
              padding: "1rem 2.5rem",
              borderRadius: "1rem",
              fontSize: "1.1rem",
              background: isSubmitting ? "#64748b" : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              boxShadow: "0 12px 28px rgba(16, 185, 129, 0.4)",
              transition: "all 0.2s ease"
            }}
          >
            {isSubmitting ? (
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="animate-spin">⏳</span> Please wait... Submitting {uploadedFiles.length} Page(s) ({submitPercent}%)...
              </span>
            ) : (
              <>
                <Send size={20} /> Submit Complete Exam Paper ({uploadedFiles.length} Page(s))
              </>
            )}
          </button>
        </div>

        {/* 🌟 FULLSCREEN SUBMISSION LOADING OVERLAY WITH LIVE PERCENTAGE */}
        {isSubmitting && (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1.5rem"
          }}>
            <div className="glass-panel" style={{
              background: "white",
              color: "#0f172a",
              padding: "2.5rem 2rem",
              borderRadius: "1.75rem",
              textAlign: "center",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            }}>
              <div className="animate-spin" style={{
                width: "56px",
                height: "56px",
                border: "5px solid #e0e7ff",
                borderTopColor: "#10b981",
                borderRadius: "50%",
                margin: "0 auto 1.5rem auto"
              }} />

              <h3 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "0.5rem", color: "#0f172a", letterSpacing: "-0.02em" }}>
                Please Wait...
              </h3>
              
              <p style={{ color: "#475569", fontSize: "0.95rem", marginBottom: "1.75rem", lineHeight: 1.5 }}>
                Submitting your exam answer paper ({uploadedFiles.length} page(s) attached)...
              </p>

              {/* Progress Bar Container */}
              <div style={{
                background: "#f1f5f9",
                borderRadius: "9999px",
                height: "14px",
                width: "100%",
                overflow: "hidden",
                marginBottom: "1rem",
                border: "1px solid #cbd5e1"
              }}>
                <div style={{
                  width: `${submitPercent}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #10b981 0%, #059669 100%)",
                  borderRadius: "9999px",
                  transition: "width 0.3s ease"
                }} />
              </div>

              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#059669", letterSpacing: "0.02em" }}>
                {submitPercent}% Complete
              </div>

              <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "1.25rem", fontWeight: 600 }}>
                ⚠️ Please do not close or refresh this page.
              </p>
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
