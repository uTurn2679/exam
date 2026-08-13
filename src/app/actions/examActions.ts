"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

async function verifyAdminRole() {
  const cookieStore = await cookies();
  const role = cookieStore.get("auth_role")?.value;
  if (role !== "ADMIN") {
    throw new Error("Access Denied: Admin authorization required.");
  }
}

export type CreateExamInput = {
  title: string;
  description?: string;
  category?: "MCQ" | "CQ";
  subject?: "Math" | "Physics" | "Higher Math" | "Chemistry" | "General" | string;
  questionFileUrl?: string;
  questionFileType?: string;
  startTime: string; // ISO or datetime-local
  endTime: string;   // ISO or datetime-local
  durationMinutes: number;
  totalMarks?: number;
  passMarks?: number;
};

function parseLocalInputToDate(inputStr: string | Date): Date {
  if (!inputStr) return new Date();
  if (inputStr instanceof Date) return inputStr;

  const cleanStr = String(inputStr);
  const [datePart, timePart] = cleanStr.split("T");
  if (datePart && timePart) {
    const [year, month, day] = datePart.split("-").map(Number);
    const timeComponents = timePart.split(":");
    const hours = Number(timeComponents[0] || 0);
    const minutes = Number(timeComponents[1] || 0);
    const seconds = Number(timeComponents[2] || 0);

    return new Date(year, month - 1, day, hours, minutes, seconds);
  }

  return new Date(inputStr);
}

export async function createExamAction(input: CreateExamInput) {
  try {
    await verifyAdminRole();
    const exam = await prisma.exam.create({
      data: {
        title: input.title,
        description: input.description || "",
        category: input.category || "MCQ",
        subject: input.subject || "General",
        questionFileUrl: input.questionFileUrl || null,
        questionFileType: input.questionFileType || null,
        startTime: parseLocalInputToDate(input.startTime),
        endTime: parseLocalInputToDate(input.endTime),
        durationMinutes: Number(input.durationMinutes),
        totalMarks: Number(input.totalMarks || 100),
        passMarks: Number(input.passMarks || 40),
        isPublished: true,
      },
    });
    revalidatePath("/admin/exams");
    revalidatePath("/exams");
    revalidatePath("/exams/history");
    return { success: true, exam };
  } catch (error: any) {
    console.error("Error creating exam:", error);
    return { success: false, error: error?.message || "Failed to create exam" };
  }
}

export async function updateExamAction(id: string, input: Partial<CreateExamInput> & { isPublished?: boolean }) {
  try {
    await verifyAdminRole();
    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.subject !== undefined) updateData.subject = input.subject;
    if (input.questionFileUrl !== undefined) updateData.questionFileUrl = input.questionFileUrl;
    if (input.questionFileType !== undefined) updateData.questionFileType = input.questionFileType;
    if (input.startTime) updateData.startTime = parseLocalInputToDate(input.startTime);
    if (input.endTime) updateData.endTime = parseLocalInputToDate(input.endTime);
    if (input.durationMinutes !== undefined) updateData.durationMinutes = Number(input.durationMinutes);
    if (input.totalMarks !== undefined) updateData.totalMarks = Number(input.totalMarks);
    if (input.passMarks !== undefined) updateData.passMarks = Number(input.passMarks);
    if (input.isPublished !== undefined) updateData.isPublished = input.isPublished;
    if (input.durationMinutes !== undefined) updateData.durationMinutes = Number(input.durationMinutes);
    if (input.totalMarks !== undefined) updateData.totalMarks = Number(input.totalMarks);
    if (input.passMarks !== undefined) updateData.passMarks = Number(input.passMarks);
    if (input.isPublished !== undefined) updateData.isPublished = input.isPublished;

    const exam = await prisma.exam.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/admin/exams");
    revalidatePath(`/admin/exams/${id}`);
    revalidatePath("/exams");
    revalidatePath("/exams/history");
    return { success: true, exam };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to update exam" };
  }
}

export async function deleteExamAction(id: string) {
  try {
    await verifyAdminRole();
    await prisma.exam.delete({
      where: { id },
    });
    revalidatePath("/admin/exams");
    revalidatePath("/exams");
    revalidatePath("/exams/history");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to delete exam" };
  }
}

export type AddQuestionInput = {
  examId: string;
  questionText: string;
  questionType: "MCQ" | "TEXT";
  options?: string[]; // Array of option strings
  correctAnswer?: string;
  marks: number;
};

export async function addQuestionAction(input: AddQuestionInput) {
  try {
    await verifyAdminRole();
    const existingCount = await prisma.question.count({
      where: { examId: input.examId },
    });

    const question = await prisma.question.create({
      data: {
        examId: input.examId,
        questionText: input.questionText,
        questionType: input.questionType,
        options: input.options ? JSON.stringify(input.options) : null,
        correctAnswer: input.correctAnswer || null,
        marks: Number(input.marks),
        order: existingCount + 1,
      },
    });

    const totalExamMarks = await prisma.question.aggregate({
      where: { examId: input.examId },
      _sum: { marks: true },
    });

    if (totalExamMarks._sum.marks) {
      await prisma.exam.update({
        where: { id: input.examId },
        data: { totalMarks: totalExamMarks._sum.marks },
      });
    }

    revalidatePath(`/admin/exams/${input.examId}`);
    return { success: true, question };
  } catch (error: any) {
    console.error("Error adding question:", error);
    return { success: false, error: error?.message || "Failed to add question" };
  }
}

export async function deleteQuestionAction(questionId: string, examId: string) {
  try {
    await verifyAdminRole();
    await prisma.question.delete({
      where: { id: questionId },
    });

    const totalExamMarks = await prisma.question.aggregate({
      where: { examId },
      _sum: { marks: true },
    });

    await prisma.exam.update({
      where: { id: examId },
      data: { totalMarks: totalExamMarks._sum.marks || 0 },
    });

    revalidatePath(`/admin/exams/${examId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to delete question" };
  }
}

export type UpdateQuestionInput = {
  questionId: string;
  examId: string;
  questionText?: string;
  questionType?: "MCQ" | "TEXT";
  options?: string[];
  correctAnswer?: string;
  marks?: number;
};

export async function updateQuestionAction(input: UpdateQuestionInput) {
  try {
    await verifyAdminRole();
    const updateData: any = {};
    if (input.questionText !== undefined) updateData.questionText = input.questionText;
    if (input.questionType !== undefined) updateData.questionType = input.questionType;
    if (input.options !== undefined) updateData.options = JSON.stringify(input.options);
    if (input.correctAnswer !== undefined) updateData.correctAnswer = input.correctAnswer;
    if (input.marks !== undefined) updateData.marks = Number(input.marks);

    const question = await prisma.question.update({
      where: { id: input.questionId },
      data: updateData,
    });

    const totalExamMarks = await prisma.question.aggregate({
      where: { examId: input.examId },
      _sum: { marks: true },
    });

    if (totalExamMarks._sum.marks) {
      await prisma.exam.update({
        where: { id: input.examId },
        data: { totalMarks: totalExamMarks._sum.marks },
      });
    }

    revalidatePath(`/admin/exams/${input.examId}`);
    return { success: true, question };
  } catch (error: any) {
    console.error("Error updating question:", error);
    return { success: false, error: error?.message || "Failed to update question" };
  }
}

export async function getStudentExamsAction() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_session")?.value;
    const userName = cookieStore.get("auth_user_name")?.value;
    const userEmail = cookieStore.get("auth_user_email")?.value;

    const exams = await prisma.exam.findMany({
      where: { isPublished: true },
      include: {
        _count: {
          select: { questions: true },
        },
        submissions: {
          where: {
            OR: [
              { userId: userId || "none" },
              { studentName: userName || "none" },
              { studentEmail: userEmail || "none" },
            ],
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { startTime: "asc" },
    });

    const formattedExams = exams.map((exam) => {
      const userSub = exam.submissions[0] || null;
      return {
        ...exam,
        userSubmission: userSub
          ? {
              id: userSub.id,
              status: userSub.status,
              totalScore: userSub.totalScore,
              submittedAt: userSub.submittedAt,
            }
          : null,
      };
    });

    return { success: true, exams: formattedExams };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to fetch exams", exams: [] };
  }
}

export async function getStudentHistoryAction() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_session")?.value;
    const userName = cookieStore.get("auth_user_name")?.value;
    const userEmail = cookieStore.get("auth_user_email")?.value;

    // Fetch all submissions by this student
    const submissions = await prisma.examSubmission.findMany({
      where: {
        OR: [
          userId ? { userId } : {},
          userName ? { studentName: userName } : {},
          userEmail ? { studentEmail: userEmail } : {},
        ],
      },
      include: {
        exam: {
          include: {
            questions: {
              orderBy: { order: "asc" },
            },
          },
        },
        answers: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch all published exams
    const allExams = await prisma.exam.findMany({
      where: { isPublished: true },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { startTime: "desc" },
    });

    return { success: true, submissions, allExams };
  } catch (error: any) {
    console.error("Error fetching student history:", error);
    return { success: false, error: error?.message || "Failed to fetch exam history", submissions: [], allExams: [] };
  }
}

export async function startStudentExamSubmissionAction(examId: string, studentInfo: { name: string; email?: string; phone?: string }) {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: true },
    });

    if (!exam) throw new Error("Exam not found");

    const cookieStore = await cookies();
    const currentUserId = cookieStore.get("auth_session")?.value || null;

    // Check for an active IN_PROGRESS session by this student
    const orConditions: any[] = [];
    if (currentUserId) {
      orConditions.push({ userId: currentUserId });
    }
    if (studentInfo.name && studentInfo.name.trim()) {
      orConditions.push({ studentName: studentInfo.name.trim() });
    }

    const inProgressSubmission = orConditions.length > 0
      ? await prisma.examSubmission.findFirst({
          where: {
            examId,
            status: "IN_PROGRESS",
            OR: orConditions,
          },
          orderBy: { createdAt: "desc" },
        })
      : null;

    if (inProgressSubmission) {
      return { success: true, submissionId: inProgressSubmission.id, startTime: inProgressSubmission.startTime };
    }

    // MULTIPLE ATTEMPTS ALLOWED: Create a new submission session for retaking the exam
    const submission = await prisma.examSubmission.create({
      data: {
        examId,
        userId: currentUserId,
        studentName: studentInfo.name.trim(),
        studentEmail: studentInfo.email ? studentInfo.email.trim().toLowerCase() : null,
        studentPhone: studentInfo.phone ? studentInfo.phone.trim() : null,
        startTime: new Date(),
        status: "IN_PROGRESS",
      },
    });

    return { success: true, submissionId: submission.id, startTime: submission.startTime };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to start exam" };
  }
}

export type SubmitAnswersPayload = {
  submissionId: string;
  answersMap?: Record<string, { selectedOption?: string; writtenAnswer?: string }>;
  answerFiles?: string[]; // Array of multiple uploaded picture/PDF file URLs
};

export async function submitExamAnswersAction(payload: SubmitAnswersPayload) {
  try {
    const { submissionId, answersMap = {}, answerFiles = [] } = payload;
    const submission = await prisma.examSubmission.findUnique({
      where: { id: submissionId },
      include: {
        exam: {
          include: { questions: true },
        },
      },
    });

    if (!submission) throw new Error("Submission not found");
    if (submission.status !== "IN_PROGRESS") {
      return { success: true, submissionId, message: "Exam already submitted" };
    }

    // TIMER DEADLINE ENFORCEMENT (With 2-minute network grace buffer)
    const startMs = new Date(submission.startTime).getTime();
    const durationMs = submission.exam.durationMinutes * 60 * 1000;
    const allowedDeadlineMs = startMs + durationMs + 120000; // 2 minutes grace buffer

    if (Date.now() > allowedDeadlineMs) {
      await prisma.examSubmission.update({
        where: { id: submissionId },
        data: {
          status: "TIME_EXPIRED",
          submittedAt: new Date(),
        },
      });
      return {
        success: false,
        isExpired: true,
        error: "Exam time limit has expired! Submissions after the countdown timer ends are strictly prohibited.",
      };
    }

    let calculatedScore = 0;
    let hasWrittenQuestions = submission.exam.category === "CQ";

    await prisma.studentAnswer.deleteMany({
      where: { submissionId },
    });

    for (const question of submission.exam.questions) {
      const studentAns = answersMap[question.id];
      let isCorrect: boolean | null = null;
      let marksObtained: number | null = null;

      if (question.questionType === "MCQ") {
        const selected = studentAns?.selectedOption || "";
        if (selected && question.correctAnswer && selected.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
          isCorrect = true;
          marksObtained = question.marks;
          calculatedScore += question.marks;
        } else {
          isCorrect = false;
          marksObtained = 0;
        }
      } else {
        hasWrittenQuestions = true;
      }

      await prisma.studentAnswer.create({
        data: {
          submissionId,
          questionId: question.id,
          selectedOption: studentAns?.selectedOption || null,
          writtenAnswer: studentAns?.writtenAnswer || null,
          isCorrect,
          marksObtained,
        },
      });
    }

    // Read answer files: Use payload answerFiles if provided; otherwise fallback to existing answerFiles in DB
    let finalAnswerFiles = answerFiles;
    if (!finalAnswerFiles || finalAnswerFiles.length === 0) {
      if (submission.answerFiles) {
        try {
          finalAnswerFiles = JSON.parse(submission.answerFiles);
        } catch (e) {
          finalAnswerFiles = submission.answerFileUrl ? [submission.answerFileUrl] : [];
        }
      } else if (submission.answerFileUrl) {
        finalAnswerFiles = [submission.answerFileUrl];
      }
    }

    const updatedStatus = hasWrittenQuestions || finalAnswerFiles.length > 0 ? "SUBMITTED" : "GRADED";

    const updatedSubmission = await prisma.examSubmission.update({
      where: { id: submissionId },
      data: {
        submittedAt: new Date(),
        totalScore: calculatedScore,
        status: updatedStatus,
        answerFileUrl: finalAnswerFiles[0] || null, // Primary file
        answerFiles: finalAnswerFiles.length > 0 ? JSON.stringify(finalAnswerFiles) : null,
      },
    });

    revalidatePath(`/exams/${submission.examId}/result/${submissionId}`);
    revalidatePath("/exams/history");
    return { success: true, submissionId: updatedSubmission.id, score: calculatedScore, status: updatedStatus };
  } catch (error: any) {
    console.error("Error submitting exam:", error);
    return { success: false, error: error?.message || "Failed to submit exam" };
  }
}

export async function getAdminExamsAction() {
  try {
    await verifyAdminRole();
    const exams = await prisma.exam.findMany({
      include: {
        _count: {
          select: { questions: true, submissions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, exams };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to fetch admin exams", exams: [] };
  }
}

export async function getExamWithQuestionsAction(examId: string) {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: { submissions: true },
        },
      },
    });
    return { success: true, exam };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to load exam details" };
  }
}

export async function getExamSubmissionsAction(examId: string) {
  try {
    await verifyAdminRole();
    const submissions = await prisma.examSubmission.findMany({
      where: { examId },
      include: {
        answers: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, submissions };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to fetch submissions", submissions: [] };
  }
}

export async function getSubmissionDetailsAction(submissionId: string) {
  try {
    const submission = await prisma.examSubmission.findUnique({
      where: { id: submissionId },
      include: {
        exam: {
          include: {
            questions: {
              orderBy: { order: "asc" },
            },
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
    });
    return { success: true, submission };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to fetch submission" };
  }
}

export async function gradeSubmissionAction(submissionId: string, manualMarks: Record<string, number>, feedback?: string) {
  try {
    await verifyAdminRole();
    let totalScore = 0;

    const submission = await prisma.examSubmission.findUnique({
      where: { id: submissionId },
      include: { answers: true },
    });

    if (!submission) throw new Error("Submission not found");

    for (const answer of submission.answers) {
      if (answer.questionId in manualMarks) {
        const assignedMarks = Number(manualMarks[answer.questionId] || 0);
        await prisma.studentAnswer.update({
          where: { id: answer.id },
          data: {
            marksObtained: assignedMarks,
            isCorrect: assignedMarks > 0,
          },
        });
        totalScore += assignedMarks;
      } else {
        totalScore += Number(answer.marksObtained || 0);
      }
    }

    if ("_cq_manual_score" in manualMarks) {
      totalScore += Number(manualMarks["_cq_manual_score"] || 0);
    }

    await prisma.examSubmission.update({
      where: { id: submissionId },
      data: {
        totalScore,
        status: "GRADED",
        feedback: feedback || null,
      },
    });

    revalidatePath(`/admin/exams/${submission.examId}/submissions`);
    revalidatePath("/exams/history");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to grade submission" };
  }
}

export async function deleteExamSubmissionAction(submissionId: string) {
  try {
    await verifyAdminRole();

    const submission = await prisma.examSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) throw new Error("Submission not found");

    await prisma.examSubmission.delete({
      where: { id: submissionId },
    });

    revalidatePath(`/admin/exams/${submission.examId}/submissions`);
    revalidatePath("/exams/history");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting submission:", error);
    return { success: false, error: error?.message || "Failed to delete submission" };
  }
}
