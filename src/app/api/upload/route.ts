import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const submissionId = formData.get("submissionId") as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize file name
    const ext = path.extname(file.name).toLowerCase();
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9]/g, "_");
    const fileName = `${Date.now()}_${baseName}${ext}`;
    const isPdf = ext === ".pdf";
    const fileType = isPdf ? "pdf" : "image";
    const mimeType = file.type || (isPdf ? "application/pdf" : ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg");

    let publicUrl = "";

    try {
      // 1. Try local disk write (works in local development environment)
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      publicUrl = `/uploads/${fileName}`;
    } catch (fsError) {
      // 2. Fallback for Vercel serverless read-only filesystem (EROFS)
      publicUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
    }

    // Incremental DB update: Save uploaded file directly to submission record in Neon DB
    if (submissionId) {
      try {
        const existingSub = await prisma.examSubmission.findUnique({
          where: { id: submissionId },
        });

        if (existingSub) {
          let currentFiles: string[] = [];
          if (existingSub.answerFiles) {
            try {
              currentFiles = JSON.parse(existingSub.answerFiles);
            } catch (e) {
              currentFiles = existingSub.answerFileUrl ? [existingSub.answerFileUrl] : [];
            }
          } else if (existingSub.answerFileUrl) {
            currentFiles = [existingSub.answerFileUrl];
          }

          currentFiles.push(publicUrl);

          await prisma.examSubmission.update({
            where: { id: submissionId },
            data: {
              answerFiles: JSON.stringify(currentFiles),
              answerFileUrl: currentFiles[0] || null,
            },
          });
        }
      } catch (dbErr) {
        console.error("Error updating submission answerFiles in DB:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      fileType,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: error?.message || "File upload failed" }, { status: 500 });
  }
}
