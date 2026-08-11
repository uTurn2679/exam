"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getExamWithQuestionsAction, addQuestionAction, deleteQuestionAction } from "@/app/actions/examActions";
import { ArrowLeft, Plus, Trash2, CheckCircle2 } from "lucide-react";

export default function AdminQuestionBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: examId } = use(params);

  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<"MCQ" | "TEXT">("MCQ");
  const [options, setOptions] = useState<string[]>(["Option A", "Option B", "Option C", "Option D"]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("Option A");
  const [marks, setMarks] = useState<number>(5);
  const [isSaving, setIsSaving] = useState(false);

  const loadExam = async () => {
    setLoading(true);
    const res = await getExamWithQuestionsAction(examId);
    if (res.success && res.exam) {
      setExam(res.exam);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadExam();
  }, [examId]);

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

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      alert("Please enter question text.");
      return;
    }

    setIsSaving(true);
    const res = await addQuestionAction({
      examId,
      questionText,
      questionType,
      options: questionType === "MCQ" ? options.filter(o => o.trim() !== "") : undefined,
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
    setIsSaving(false);
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
        <div className="animate-spin" style={{ width: "40px", height: "40px", border: "4px solid #cbd5e1", borderTopColor: "#2563eb", borderRadius: "50%", margin: "0 auto 1rem auto" }}></div>
        <p style={{ color: "#64748b" }}>Loading Question Builder...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="container" style={{ padding: "4rem 0" }}>
        <h2>Exam Not Found</h2>
        <Link href="/admin/exams" className="btn btn-primary" style={{ marginTop: "1rem" }}>Back to Admin Exams</Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "3rem 0" }}>
      <div className="container" style={{ maxWidth: "900px" }}>
        <Link href="/admin/exams" className="nav-link" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginBottom: "1.5rem", fontWeight: 600, color: "#64748b" }}>
          <ArrowLeft size={16} /> Back to Exam Dashboard
        </Link>

        <div style={{ background: "white", padding: "1.75rem", borderRadius: "1rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}>Question Builder Room</span>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a" }}>{exam.title}</h1>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
              Duration: <strong>{exam.durationMinutes} mins</strong> • Questions: <strong>{exam.questions.length}</strong> • Total Marks: <strong>{exam.totalMarks}</strong>
            </p>
          </div>
          <Link href={`/admin/exams/${examId}/submissions`} className="btn btn-outline">
            View Student Submissions ({exam._count.submissions})
          </Link>
        </div>

        <div style={{ background: "white", padding: "2rem", borderRadius: "1rem", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)", marginBottom: "2.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Plus size={20} color="#2563eb" /> Add New Exam Question
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
                <select
                  value={questionType}
                  onChange={(e: any) => setQuestionType(e.target.value)}
                  className="input-field"
                >
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
                        style={{ width: "18px", height: "18px", accentColor: "#2563eb", cursor: "pointer" }}
                        title="Set as correct answer"
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
                  style={{ background: "white", border: "1px dashed #cbd5e1", color: "#2563eb", width: "100%", justifyContent: "center" }}
                >
                  <Plus size={16} /> Add Another Choice Option
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary"
              style={{ background: "#2563eb", padding: "0.75rem 1.5rem", borderRadius: "0.75rem" }}
            >
              {isSaving ? "Saving Question..." : "Save Question to Exam"}
            </button>
          </form>
        </div>

        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", marginBottom: "1.25rem" }}>
          Current Exam Questions ({exam.questions.length})
        </h3>

        {exam.questions.length === 0 ? (
          <p style={{ color: "#64748b", fontStyle: "italic", background: "white", padding: "2rem", borderRadius: "1rem", textAlign: "center" }}>
            No questions added yet. Use the form above to add your first question.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {exam.questions.map((q: any, idx: number) => {
              let parsedOptions: string[] = [];
              if (q.questionType === "MCQ" && q.options) {
                try {
                  parsedOptions = JSON.parse(q.options);
                } catch (e) {
                  parsedOptions = [];
                }
              }

              return (
                <div
                  key={q.id}
                  style={{
                    background: "white",
                    borderRadius: "1rem",
                    border: "1px solid #e2e8f0",
                    padding: "1.5rem",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, background: "#dbeafe", color: "#1d4ed8", padding: "0.25rem 0.65rem", borderRadius: "0.5rem" }}>
                        Q{idx + 1} • {q.questionType}
                      </span>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>
                        {q.marks} Marks
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "0.45rem", borderRadius: "0.5rem", cursor: "pointer" }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <h4 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#0f172a", marginBottom: "0.75rem" }}>
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
                              fontWeight: isCorrect ? 600 : 400,
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
      </div>
    </div>
  );
}
