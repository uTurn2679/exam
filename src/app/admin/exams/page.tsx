"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminExamsAction, createExamAction, deleteExamAction, updateExamAction } from "@/app/actions/examActions";
import { getAuthSessionAction } from "@/app/actions/authActions";
import { Plus, Edit3, Trash2, Users, FileText, ShieldCheck, Sparkles, ArrowRight, Lock, FileCheck, BookOpen, Layers, CheckSquare, Clock } from "lucide-react";

export default function AdminExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);

  // Form state with subject
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "MCQ" as "MCQ" | "CQ",
    subject: "Math",
    startTime: "",
    endTime: "",
    durationMinutes: 30,
    totalMarks: 100,
    passMarks: 40,
  });

  // Admin Question File upload state for CQ exams
  const [uploadingFile, setUploadingFile] = useState(false);
  const [questionFileUrl, setQuestionFileUrl] = useState<string | null>(null);
  const [questionFileType, setQuestionFileType] = useState<string | null>(null);

  const loadExams = async () => {
    setLoading(true);
    const authRes = await getAuthSessionAction();
    if (!authRes.isLoggedIn || authRes.user?.role !== "ADMIN") {
      setIsAdminUser(false);
      setLoading(false);
      return;
    }

    setIsAdminUser(true);
    const res = await getAdminExamsAction();
    if (res.success) {
      setExams(res.exams || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (result.success) {
        setQuestionFileUrl(result.url);
        setQuestionFileType(result.fileType);
      } else {
        alert("Upload failed: " + result.error);
      }
    } catch (err: any) {
      alert("Error uploading file: " + err?.message);
    }
    setUploadingFile(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.startTime || !formData.endTime) {
      alert("Please fill in all required exam fields.");
      return;
    }

    const res = await createExamAction({
      ...formData,
      questionFileUrl: questionFileUrl || undefined,
      questionFileType: questionFileType || undefined,
      durationMinutes: Number(formData.durationMinutes),
      totalMarks: Number(formData.totalMarks),
      passMarks: Number(formData.passMarks),
    });

    if (res.success) {
      setShowCreateModal(false);
      setFormData({
        title: "",
        description: "",
        category: "MCQ",
        subject: "Math",
        startTime: "",
        endTime: "",
        durationMinutes: 30,
        totalMarks: 100,
        passMarks: 40,
      });
      setQuestionFileUrl(null);
      setQuestionFileType(null);
      loadExams();
    } else {
      alert("Error creating exam: " + res.error);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete the exam "${title}"?`)) return;
    const res = await deleteExamAction(id);
    if (res.success) {
      loadExams();
    } else {
      alert("Failed to delete exam: " + res.error);
    }
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    const res = await updateExamAction(id, { isPublished: !current });
    if (res.success) {
      loadExams();
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "6rem 0" }}>
        <div className="animate-spin" style={{ width: "42px", height: "42px", border: "4px solid #cbd5e1", borderTopColor: "#4f46e5", borderRadius: "50%", margin: "0 auto 1rem auto" }}></div>
        <p style={{ color: "#64748b", fontWeight: 600 }}>Verifying Admin Credentials...</p>
      </div>
    );
  }

  if (isAdminUser === false) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 1rem" }}>
        <div className="glass-panel" style={{ maxWidth: "560px", padding: "3rem 2rem", textAlign: "center", borderRadius: "1.5rem" }}>
          <div style={{ background: "#fef2f2", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem auto" }}>
            <Lock size={40} color="#dc2626" />
          </div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>
            Admin Access Restricted
          </h2>
          <p style={{ color: "#64748b", marginBottom: "2rem", fontSize: "1.05rem" }}>
            You need to sign in as Admin to manage exams, create question papers, and grade student submissions.
          </p>
          <Link href="/login" className="btn btn-primary" style={{ padding: "0.85rem 2rem" }}>
            Go to Admin Login <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  const totalSubmissions = exams.reduce((acc, curr) => acc + (curr._count?.submissions || 0), 0);
  const publishedCount = exams.filter(e => e.isPublished).length;

  return (
    <div style={{ minHeight: "100vh", padding: "3rem 0" }}>
      <div className="container">
        {/* Admin Executive Header Banner */}
        <div className="hero-gradient" style={{
          padding: "3.5rem 2.5rem",
          color: "white",
          marginBottom: "3rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.75rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem", position: "relative", zIndex: 2 }}>
            <div>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(129, 140, 248, 0.2)",
                color: "#a5b4fc",
                border: "1px solid rgba(129, 140, 248, 0.35)",
                padding: "0.4rem 1rem",
                borderRadius: "9999px",
                fontSize: "0.85rem",
                fontWeight: 700,
                marginBottom: "1rem"
              }}>
                <ShieldCheck size={16} /> Admin Management Portal
              </div>

              <h1 style={{ fontSize: "2.6rem", fontWeight: 800, color: "white", marginBottom: "0.5rem", letterSpacing: "-0.03em" }}>
                Exam Control & Assessment Dashboard
              </h1>

              <p style={{ color: "#cbd5e1", fontSize: "1.05rem", maxWidth: "620px", lineHeight: 1.6 }}>
                Create subject-wise MCQ & CQ exams (Math, Physics, Higher Math, Chemistry), set countdown timers, and grade student submissions.
              </p>
            </div>

            {/* SINGLE CLEAN "CREATE EXAM" BUTTON */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn"
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white",
                padding: "0.9rem 1.75rem",
                borderRadius: "0.95rem",
                fontWeight: 800,
                fontSize: "0.95rem",
                boxShadow: "0 12px 28px rgba(16, 185, 129, 0.45)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.6rem"
              }}
            >
              <Plus size={22} /> Create New Exam
            </button>
          </div>

          {/* Admin Live Overview Metrics Bar */}
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
                <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>ACTIVE PUBLISHED</span>
                <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "white" }}>{publishedCount} Active</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <div style={{ background: "rgba(245, 158, 11, 0.3)", padding: "0.6rem", borderRadius: "0.75rem", color: "#fbbf24" }}>
                <Users size={22} />
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>SUBMISSIONS</span>
                <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "white" }}>{totalSubmissions} Papers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Exams Grid List */}
        {exams.length === 0 ? (
          <div className="glass-panel" style={{ padding: "4.5rem 2rem", textAlign: "center", border: "2px dashed #cbd5e1", borderRadius: "1.5rem" }}>
            <FileText size={48} color="#94a3b8" style={{ margin: "0 auto 1rem auto" }} />
            <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
              No Exams Created Yet
            </h3>
            <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
              Use the <strong>"Create New Exam"</strong> button in the top banner to set up your first assessment paper.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="glass-panel"
                style={{
                  padding: "1.85rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  background: "white",
                  borderRadius: "1.25rem"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                      <span
                        onClick={() => handleTogglePublish(exam.id, exam.isPublished)}
                        style={{
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          padding: "0.35rem 0.75rem",
                          borderRadius: "9999px",
                          background: exam.isPublished ? "#dcfce7" : "#f1f5f9",
                          color: exam.isPublished ? "#15803d" : "#64748b",
                        }}
                      >
                        {exam.isPublished ? "● Published" : "○ Draft"}
                      </span>

                      <span style={{ fontSize: "0.75rem", fontWeight: 800, background: "#eff6ff", color: "#1d4ed8", padding: "0.35rem 0.65rem", borderRadius: "9999px", border: "1px solid #bfdbfe" }}>
                        📚 {exam.subject || "General"}
                      </span>

                      <span style={{ fontSize: "0.75rem", fontWeight: 800, background: exam.category === "CQ" ? "#fef3c7" : "#e0e7ff", color: exam.category === "CQ" ? "#b45309" : "#3730a3", padding: "0.35rem 0.65rem", borderRadius: "9999px" }}>
                        {exam.category === "CQ" ? "📄 CQ Written" : "⚡ MCQ"}
                      </span>
                    </div>

                    <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#4f46e5", background: "#f5f3ff", padding: "0.25rem 0.65rem", borderRadius: "0.5rem" }}>
                      {exam.totalMarks} Marks
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem", letterSpacing: "-0.01em" }}>
                    {exam.title}
                  </h3>
                  <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1.25rem", lineHeight: 1.5 }}>
                    {exam.description || "No description provided."}
                  </p>

                  <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "0.85rem", display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.85rem", color: "#475569", marginBottom: "1.5rem", border: "1px solid #f1f5f9" }}>
                    <div><strong>Start:</strong> {new Date(exam.startTime).toLocaleString()}</div>
                    <div><strong>End:</strong> {new Date(exam.endTime).toLocaleString()}</div>
                    <div><strong>Timer:</strong> {exam.durationMinutes} Mins</div>
                    {exam.questionFileUrl ? (
                      <div style={{ color: "#2563eb", fontWeight: 700 }}><strong>Question Attachment:</strong> Uploaded PDF/Photo</div>
                    ) : (
                      <div><strong>Questions:</strong> {exam._count.questions} item(s)</div>
                    )}
                    <div><strong>Submissions:</strong> {exam._count.submissions} paper(s)</div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {exam.category === "MCQ" ? (
                    <Link href={`/admin/exams/${exam.id}/edit`} className="btn btn-outline" style={{ width: "100%", justifyContent: "center", borderRadius: "0.75rem" }}>
                      <Edit3 size={16} /> Manage Questions ({exam._count.questions})
                    </Link>
                  ) : (
                    <a href={exam.questionFileUrl || "#"} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ width: "100%", justifyContent: "center", borderRadius: "0.75rem" }}>
                      <FileCheck size={16} /> View Question File
                    </a>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.6rem" }}>
                    <Link href={`/admin/exams/${exam.id}/submissions`} className="btn" style={{ background: "#f1f5f9", color: "#1e293b", justifyContent: "center", borderRadius: "0.75rem" }}>
                      <Users size={16} /> Submissions ({exam._count.submissions})
                    </Link>
                    <button onClick={() => handleDelete(exam.id, exam.title)} className="btn" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "0.75rem", padding: "0.6rem" }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Creating New Exam */}
        {showCreateModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "1rem" }}>
            <div className="glass-panel" style={{ background: "white", width: "100%", maxWidth: "640px", padding: "2.25rem", borderRadius: "1.5rem", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#4f46e5", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                <Sparkles size={16} /> New Assessment Session
              </div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "1.5rem", color: "#0f172a", letterSpacing: "-0.02em" }}>
                Create Subject Exam Paper
              </h2>

              <form onSubmit={handleCreate}>
                {/* Subject Selector */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <label className="input-label">Select Subject *</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="input-field"
                    style={{ fontWeight: 700, color: "#1e293b" }}
                  >
                    <option value="Math">📐 Math (General Math)</option>
                    <option value="Physics">⚡ Physics</option>
                    <option value="Higher Math">📊 Higher Math</option>
                    <option value="Chemistry">🧪 Chemistry</option>
                    <option value="General">📚 General Subject</option>
                  </select>
                </div>

                {/* Category Radio Toggle: MCQ vs CQ */}
                <div style={{ marginBottom: "1.25rem" }}>
                  <label className="input-label">Select Exam Format *</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <label
                      onClick={() => setFormData({ ...formData, category: "MCQ" })}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.75rem 1rem",
                        borderRadius: "0.75rem",
                        border: formData.category === "MCQ" ? "2px solid #4f46e5" : "1px solid #e2e8f0",
                        background: formData.category === "MCQ" ? "#f5f3ff" : "#f8fafc",
                        color: formData.category === "MCQ" ? "#4338ca" : "#475569",
                        fontWeight: formData.category === "MCQ" ? 800 : 500,
                        cursor: "pointer",
                        fontSize: "0.9rem"
                      }}
                    >
                      <input type="radio" checked={formData.category === "MCQ"} onChange={() => {}} style={{ display: "none" }} />
                      ⚡ MCQ (Auto-Graded)
                    </label>

                    <label
                      onClick={() => setFormData({ ...formData, category: "CQ" })}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.75rem 1rem",
                        borderRadius: "0.75rem",
                        border: formData.category === "CQ" ? "2px solid #f59e0b" : "1px solid #e2e8f0",
                        background: formData.category === "CQ" ? "#fffbeb" : "#f8fafc",
                        color: formData.category === "CQ" ? "#b45309" : "#475569",
                        fontWeight: formData.category === "CQ" ? 800 : 500,
                        cursor: "pointer",
                        fontSize: "0.9rem"
                      }}
                    >
                      <input type="radio" checked={formData.category === "CQ"} onChange={() => {}} style={{ display: "none" }} />
                      📄 CQ (Creative Written Upload)
                    </label>
                  </div>
                </div>

                {/* If CQ exam, allow Admin to upload Question Paper (PDF / Image) */}
                {formData.category === "CQ" && (
                  <div style={{ background: "#fffbeb", padding: "1.25rem", borderRadius: "1rem", border: "1px solid #fcd34d", marginBottom: "1.25rem" }}>
                    <label className="input-label" style={{ color: "#92400e" }}>
                      Upload Question Paper PDF or Question Photo *
                    </label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      style={{ marginBottom: "0.5rem", fontSize: "0.85rem" }}
                    />
                    {uploadingFile && <p style={{ fontSize: "0.85rem", color: "#b45309" }}>Uploading question file...</p>}
                    {questionFileUrl && (
                      <p style={{ fontSize: "0.85rem", color: "#15803d", fontWeight: 700 }}>
                        ✓ Question Paper Attached: <a href={questionFileUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>Preview File</a>
                      </p>
                    )}
                  </div>
                )}

                <div style={{ marginBottom: "1.25rem" }}>
                  <label className="input-label">Exam Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Higher Math Chapter 3 Midterm Test"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div style={{ marginBottom: "1.25rem" }}>
                  <label className="input-label">Description (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Brief instructions or syllabus topics covered..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
                  <div>
                    <label className="input-label">Start Date & Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="input-label">End Date & Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.85rem", marginBottom: "1.75rem" }}>
                  <div>
                    <label className="input-label">Timer (Mins) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="input-label">Total Marks *</label>
                    <input
                      type="number"
                      required
                      value={formData.totalMarks}
                      onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="input-label">Pass Marks *</label>
                    <input
                      type="number"
                      required
                      value={formData.passMarks}
                      onChange={(e) => setFormData({ ...formData, passMarks: Number(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.85rem" }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Save & Create Exam
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
