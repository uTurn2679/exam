"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getExamWithQuestionsAction, updateExamAction, addQuestionAction, updateQuestionAction, deleteQuestionAction } from "@/app/actions/examActions";
import { ArrowLeft, Plus, Trash2, CheckCircle2, Calendar, Clock, Edit3, Save, Upload, FileText, X } from "lucide-react";

export default function AdminEditExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: examId } = use(params);

  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Exam Details Form State
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("General");
  const [category, setCategory] = useState<"MCQ" | "CQ">("MCQ");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [passMarks, setPassMarks] = useState(40);
  const [questionFileUrl, setQuestionFileUrl] = useState("");
  const [questionFileType, setQuestionFileType] = useState<"pdf" | "image" | "">("");
  const [uploadingQuestionFile, setUploadingQuestionFile] = useState(false);
  const [isUpdatingExam, setIsUpdatingExam] = useState(false);

  // Add Question Form State
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<"MCQ" | "TEXT">("MCQ");
  const [options, setOptions] = useState<string[]>(["Option A", "Option B", "Option C", "Option D"]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("Option A");
  const [marks, setMarks] = useState<number>(5);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  // Edit Question Modal State
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [editQuestionText, setEditQuestionText] = useState("");
  const [editQuestionType, setEditQuestionType] = useState<"MCQ" | "TEXT">("MCQ");
  const [editOptions, setEditOptions] = useState<string[]>([]);
  const [editCorrectAnswer, setEditCorrectAnswer] = useState<string>("");
  const [editMarks, setEditMarks] = useState<number>(5);
  const [isUpdatingQuestion, setIsUpdatingQuestion] = useState(false);

  const loadExam = async () => {
    setLoading(true);
    const res = await getExamWithQuestionsAction(examId);
    if (res.success && res.exam) {
      const e = res.exam;
      setExam(e);
      setTitle(e.title || "");
      setSubject(e.subject || "General");
      setCategory(e.category === "CQ" ? "CQ" : "MCQ");
      
      // Format ISO dates for datetime-local inputs
      if (e.startTime) {
        const d = new Date(e.startTime);
        setStartTime(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
      }
      if (e.endTime) {
        const d = new Date(e.endTime);
        setEndTime(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
      }

      setDurationMinutes(e.durationMinutes || 30);
      setPassMarks(e.passMarks || 40);
      setQuestionFileUrl(e.questionFileUrl || "");
      setQuestionFileType(e.questionFileType === "pdf" ? "pdf" : e.questionFileType === "image" ? "image" : "");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadExam();
  }, [examId]);

  // Question Document File Upload (PDF/Image)
  const handleQuestionFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingQuestionFile(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (result.success && result.url) {
        setQuestionFileUrl(result.url);
        setQuestionFileType(result.fileType === "pdf" ? "pdf" : "image");
      } else {
        alert("Upload failed: " + (result.error || "Unknown error"));
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Error uploading file.");
    }
    setUploadingQuestionFile(false);
  };

  // Update Exam Schedule, Title, and Time Settings
  const handleUpdateExamDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startTime || !endTime) {
      alert("Please fill in title, start date/time, and end date/time.");
      return;
    }

    setIsUpdatingExam(true);
    const res = await updateExamAction(examId, {
      title,
      subject,
      category,
      startTime,
      endTime,
      durationMinutes: Number(durationMinutes),
      passMarks: Number(passMarks),
      questionFileUrl: questionFileUrl || undefined,
      questionFileType: questionFileType || undefined,
    });

    if (res.success) {
      alert("Exam schedule, date/time, and details updated successfully!");
      loadExam();
    } else {
      alert("Error updating exam: " + res.error);
    }
    setIsUpdatingExam(false);
  };

  // Add Question Options Handlers
  const handleAddOption = () => {
    setOptions([...options, `Option ${String.fromCharCode(65 + options.length)}`]);
  };

  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...options];
    const oldVal = updated[idx];
    updated[idx] = val;
    setOptions(updated);
    if (correctAnswer === oldVal) {
      setCorrectAnswer(val);
    }
  };

  const handleRemoveOption = (idx: number) => {
    if (options.length <= 2) {
      alert("At least 2 options are required for MCQ questions.");
      return;
    }
    const removed = options[idx];
    const updated = options.filter((_, i) => i !== idx);
    setOptions(updated);
    if (correctAnswer === removed) {
      setCorrectAnswer(updated[0] || "");
    }
  };

  // Add Question Submit
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      alert("Please enter question text.");
      return;
    }

    setIsAddingQuestion(true);
    const res = await addQuestionAction({
      examId,
      questionText,
      questionType,
      options: questionType === "MCQ" ? options.filter((o) => o.trim() !== "") : undefined,
      correctAnswer: questionType === "MCQ" ? correctAnswer : undefined,
      marks: Number(marks),
    });

    if (res.success) {
      setQuestionText("");
      setOptions(["Option A", "Option B", "Option C", "Option D"]);
      setCorrectAnswer("Option A");
      loadExam();
    } else {
      alert("Failed to add question: " + res.error);
    }
    setIsAddingQuestion(false);
  };

  // Open Edit Question Modal
  const handleOpenEditQuestion = (q: any) => {
    setEditingQuestion(q);
    setEditQuestionText(q.questionText || "");
    setEditQuestionType(q.questionType || "MCQ");
    setEditMarks(q.marks || 5);

    let parsedOpts: string[] = ["Option A", "Option B", "Option C", "Option D"];
    if (q.options) {
      try {
        parsedOpts = JSON.parse(q.options);
      } catch (e) {}
    }
    setEditOptions(parsedOpts);
    setEditCorrectAnswer(q.correctAnswer || parsedOpts[0] || "");
  };

  const handleEditAddOption = () => {
    setEditOptions([...editOptions, `Option ${String.fromCharCode(65 + editOptions.length)}`]);
  };

  const handleEditOptionChange = (idx: number, val: string) => {
    const updated = [...editOptions];
    const oldVal = updated[idx];
    updated[idx] = val;
    setEditOptions(updated);
    if (editCorrectAnswer === oldVal) {
      setEditCorrectAnswer(val);
    }
  };

  const handleEditRemoveOption = (idx: number) => {
    if (editOptions.length <= 2) {
      alert("At least 2 options are required for MCQ questions.");
      return;
    }
    const removed = editOptions[idx];
    const updated = editOptions.filter((_, i) => i !== idx);
    setEditOptions(updated);
    if (editCorrectAnswer === removed) {
      setEditCorrectAnswer(updated[0] || "");
    }
  };

  // Save Edited Question
  const handleSaveEditedQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion || !editQuestionText.trim()) return;

    setIsUpdatingQuestion(true);
    const res = await updateQuestionAction({
      questionId: editingQuestion.id,
      examId,
      questionText: editQuestionText,
      questionType: editQuestionType,
      options: editQuestionType === "MCQ" ? editOptions.filter((o) => o.trim() !== "") : undefined,
      correctAnswer: editQuestionType === "MCQ" ? editCorrectAnswer : undefined,
      marks: Number(editMarks),
    });

    if (res.success) {
      alert("Question updated successfully!");
      setEditingQuestion(null);
      loadExam();
    } else {
      alert("Failed to update question: " + res.error);
    }
    setIsUpdatingQuestion(false);
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    const res = await deleteQuestionAction(qId, examId);
    if (res.success) {
      loadExam();
    } else {
      alert("Failed to delete question.");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 0" }}>
        <div className="animate-spin" style={{ width: "42px", height: "42px", border: "4px solid #cbd5e1", borderTopColor: "#4f46e5", borderRadius: "50%", margin: "0 auto 1rem auto" }}></div>
        <p style={{ color: "#64748b", fontWeight: 600 }}>Loading Exam Editor...</p>
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
      <div className="container" style={{ maxWidth: "950px" }}>
        <Link href="/admin/exams" className="nav-link" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginBottom: "1.5rem", fontWeight: 600, color: "#64748b" }}>
          <ArrowLeft size={16} /> Back to Exam Dashboard
        </Link>

        {/* SECTION 1: UPDATE EXAM SCHEDULE, DATE, TIME & DETAILS */}
        <div className="glass-panel" style={{ background: "white", padding: "2rem", borderRadius: "1.25rem", border: "1px solid #e2e8f0", marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#4f46e5", textTransform: "uppercase" }}>Exam Management & Schedule Editor</span>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a" }}>Edit Exam Schedule & Questions</h1>
            </div>
            <Link href={`/admin/exams/${examId}/submissions`} className="btn btn-outline" style={{ borderRadius: "0.75rem" }}>
              View Student Submissions ({exam._count?.submissions || 0})
            </Link>
          </div>

          <form onSubmit={handleUpdateExamDetails}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
              <div>
                <label className="input-label" style={{ fontWeight: 800 }}>Exam Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label" style={{ fontWeight: 800 }}>Subject</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field">
                  <option value="General">General</option>
                  <option value="Physics">Physics</option>
                  <option value="Higher Math">Higher Math</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="ICT">ICT</option>
                  <option value="Bangla">Bangla</option>
                  <option value="English">English</option>
                </select>
              </div>
            </div>

            {/* DATE & TIME SCHEDULE EDITING SECTION */}
            <div style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "1rem", border: "1px solid #cbd5e1", marginBottom: "1.5rem" }}>
              <h4 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Calendar size={18} color="#4f46e5" /> Exam Date, Start Time & End Time Settings
              </h4>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="input-label" style={{ fontWeight: 700 }}>Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="input-field"
                    style={{ background: "white" }}
                  />
                </div>

                <div>
                  <label className="input-label" style={{ fontWeight: 700 }}>End Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="input-field"
                    style={{ background: "white" }}
                  />
                </div>

                <div>
                  <label className="input-label" style={{ fontWeight: 700 }}>Duration (Minutes)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="input-field"
                    style={{ background: "white" }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>
              <div>
                <label className="input-label" style={{ fontWeight: 800 }}>Category</label>
                <select value={category} onChange={(e: any) => setCategory(e.target.value)} className="input-field">
                  <option value="MCQ">⚡ MCQ Exam (Auto-graded)</option>
                  <option value="CQ">📄 CQ Creative Written Exam (Photo upload)</option>
                </select>
              </div>

              <div>
                <label className="input-label" style={{ fontWeight: 800 }}>Pass Marks</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={passMarks}
                  onChange={(e) => setPassMarks(Number(e.target.value))}
                  className="input-field"
                />
              </div>
            </div>

            {/* Question File Upload for CQ exams */}
            {category === "CQ" && (
              <div style={{ background: "#f5f3ff", padding: "1.25rem", borderRadius: "0.85rem", border: "1px solid #c7d2fe", marginBottom: "1.5rem" }}>
                <label className="input-label" style={{ fontWeight: 800, color: "#3730a3" }}>CQ Question Document (PDF or Photo Attachment)</label>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                  <label className="btn btn-outline" style={{ background: "white", cursor: "pointer" }}>
                    <Upload size={16} /> Choose PDF or Image
                    <input type="file" accept="application/pdf,image/*" onChange={handleQuestionFileUpload} style={{ display: "none" }} />
                  </label>
                  {uploadingQuestionFile && <span style={{ fontSize: "0.85rem", color: "#4f46e5", fontWeight: 700 }}>Uploading file...</span>}
                  {questionFileUrl && (
                    <span style={{ fontSize: "0.85rem", color: "#16a34a", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <FileText size={16} /> Question document attached!
                    </span>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isUpdatingExam}
              className="btn btn-primary"
              style={{ padding: "0.8rem 1.75rem", borderRadius: "0.75rem", background: "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)" }}
            >
              <Save size={18} /> {isUpdatingExam ? "Saving Schedule..." : "Save Exam Schedule & Details"}
            </button>
          </form>
        </div>

        {/* SECTION 2: ADD NEW QUESTION FORM */}
        <div className="glass-panel" style={{ background: "white", padding: "2rem", borderRadius: "1.25rem", border: "1px solid #e2e8f0", marginBottom: "2.5rem" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Plus size={20} color="#4f46e5" /> Add New Exam Question
          </h2>

          <form onSubmit={handleAddQuestion}>
            <div style={{ marginBottom: "1.25rem" }}>
              <label className="input-label">Question Text *</label>
              <textarea
                rows={3}
                required
                placeholder="Enter the question text clearly here..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="input-field"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
              <div>
                <label className="input-label">Question Type</label>
                <select value={questionType} onChange={(e: any) => setQuestionType(e.target.value)} className="input-field">
                  <option value="MCQ">Multiple Choice Question (MCQ)</option>
                  <option value="TEXT">Short Written Response / Essay</option>
                </select>
              </div>
              <div>
                <label className="input-label">Marks for this Question</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={marks}
                  onChange={(e) => setMarks(Number(e.target.value))}
                  className="input-field"
                />
              </div>
            </div>

            {questionType === "MCQ" && (
              <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "0.75rem", border: "1px solid #f1f5f9", marginBottom: "1.5rem" }}>
                <label className="input-label" style={{ marginBottom: "0.75rem", display: "block" }}>
                  Options & Choice Settings (Select radio for correct answer key)
                </label>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
                  {options.map((opt, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <input
                        type="radio"
                        name="correctOpt"
                        checked={correctAnswer === opt}
                        onChange={() => setCorrectAnswer(opt)}
                        style={{ width: "18px", height: "18px", accentColor: "#4f46e5", cursor: "pointer" }}
                      />
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        className="input-field"
                        style={{ background: "white" }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "0.6rem", borderRadius: "0.5rem", cursor: "pointer" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddOption}
                  className="btn"
                  style={{ background: "white", border: "1px dashed #cbd5e1", color: "#4f46e5", width: "100%", justifyContent: "center" }}
                >
                  <Plus size={16} /> Add Another Choice Option
                </button>
              </div>
            )}

            <button type="submit" disabled={isAddingQuestion} className="btn btn-primary" style={{ borderRadius: "0.75rem", padding: "0.75rem 1.5rem" }}>
              {isAddingQuestion ? "Saving Question..." : "Save Question to Exam"}
            </button>
          </form>
        </div>

        {/* SECTION 3: CURRENT QUESTIONS LIST & EDIT QUESTION MODAL */}
        <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", marginBottom: "1.25rem" }}>
          Current Exam Questions ({exam.questions.length})
        </h3>

        {exam.questions.length === 0 ? (
          <p style={{ color: "#64748b", fontStyle: "italic", background: "white", padding: "2rem", borderRadius: "1rem", textAlign: "center" }}>
            No questions added yet. Use the form above to add questions.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {exam.questions.map((q: any, idx: number) => {
              let parsedOptions: string[] = [];
              if (q.questionType === "MCQ" && q.options) {
                try {
                  parsedOptions = JSON.parse(q.options);
                } catch (e) {}
              }

              return (
                <div key={q.id} className="glass-panel" style={{ background: "white", borderRadius: "1rem", padding: "1.5rem", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: 800, background: "#e0e7ff", color: "#3730a3", padding: "0.25rem 0.65rem", borderRadius: "0.5rem" }}>
                        Q{idx + 1} • {q.questionType}
                      </span>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#64748b" }}>
                        {q.marks} Marks
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => handleOpenEditQuestion(q)}
                        className="btn btn-outline"
                        style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem", borderRadius: "0.5rem" }}
                      >
                        <Edit3 size={14} /> Edit Question
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "0.45rem 0.75rem", borderRadius: "0.5rem", cursor: "pointer" }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.75rem" }}>
                    {q.questionText}
                  </h4>

                  {q.questionType === "MCQ" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "0.75rem" }}>
                      {parsedOptions.map((opt, oIdx) => {
                        const isCorrect = q.correctAnswer === opt;
                        return (
                          <div
                            key={oIdx}
                            style={{
                              padding: "0.6rem 0.85rem",
                              borderRadius: "0.5rem",
                              background: isCorrect ? "#dcfce7" : "#f8fafc",
                              border: isCorrect ? "1px solid #86efac" : "1px solid #f1f5f9",
                              color: isCorrect ? "#166534" : "#475569",
                              fontSize: "0.875rem",
                              fontWeight: isCorrect ? 700 : 400,
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem"
                            }}
                          >
                            {isCorrect && <CheckCircle2 size={14} color="#166534" />}
                            {opt}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* EDIT QUESTION MODAL */}
        {editingQuestion && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "1rem" }}>
            <div className="glass-panel" style={{ background: "white", width: "100%", maxWidth: "700px", padding: "2.25rem", borderRadius: "1.5rem", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a" }}>Edit Question</h3>
                <button onClick={() => setEditingQuestion(null)} className="btn btn-outline" style={{ padding: "0.35rem 0.75rem", borderRadius: "0.5rem" }}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveEditedQuestion}>
                <div style={{ marginBottom: "1.25rem" }}>
                  <label className="input-label">Question Text *</label>
                  <textarea
                    rows={3}
                    required
                    value={editQuestionText}
                    onChange={(e) => setEditQuestionText(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
                  <div>
                    <label className="input-label">Question Type</label>
                    <select value={editQuestionType} onChange={(e: any) => setEditQuestionType(e.target.value)} className="input-field">
                      <option value="MCQ">Multiple Choice Question (MCQ)</option>
                      <option value="TEXT">Short Written Response / Essay</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Marks for this Question</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={editMarks}
                      onChange={(e) => setEditMarks(Number(e.target.value))}
                      className="input-field"
                    />
                  </div>
                </div>

                {editQuestionType === "MCQ" && (
                  <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "0.75rem", border: "1px solid #f1f5f9", marginBottom: "1.5rem" }}>
                    <label className="input-label" style={{ marginBottom: "0.75rem", display: "block" }}>
                      Options & Choice Settings (Select radio for correct answer key)
                    </label>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
                      {editOptions.map((opt, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <input
                            type="radio"
                            name="editCorrectOpt"
                            checked={editCorrectAnswer === opt}
                            onChange={() => setEditCorrectAnswer(opt)}
                            style={{ width: "18px", height: "18px", accentColor: "#4f46e5", cursor: "pointer" }}
                          />
                          <input
                            type="text"
                            required
                            value={opt}
                            onChange={(e) => handleEditOptionChange(idx, e.target.value)}
                            className="input-field"
                            style={{ background: "white" }}
                          />
                          <button
                            type="button"
                            onClick={() => handleEditRemoveOption(idx)}
                            style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "0.6rem", borderRadius: "0.5rem", cursor: "pointer" }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleEditAddOption}
                      className="btn"
                      style={{ background: "white", border: "1px dashed #cbd5e1", color: "#4f46e5", width: "100%", justifyContent: "center" }}
                    >
                      <Plus size={16} /> Add Another Choice Option
                    </button>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                  <button type="button" onClick={() => setEditingQuestion(null)} className="btn btn-outline" style={{ borderRadius: "0.75rem" }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isUpdatingQuestion} className="btn btn-primary" style={{ borderRadius: "0.75rem" }}>
                    <Save size={16} /> {isUpdatingQuestion ? "Updating..." : "Save Changes"}
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
