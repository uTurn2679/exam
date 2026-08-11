import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from "path";
import fs from "fs";
import os from "os";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;

if (typeof window === "undefined") {
  if (!globalForPrisma.prisma) {
    let targetDbPath = path.resolve(process.cwd(), "dev.db");

    // If running in Vercel / Serverless environment (/tmp directory writable)
    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      try {
        const tmpDir = os.tmpdir();
        const tmpDbPath = path.join(tmpDir, "dev.db");

        if (!fs.existsSync(tmpDbPath)) {
          const sourceDbPath = path.resolve(process.cwd(), "dev.db");
          if (fs.existsSync(sourceDbPath)) {
            fs.copyFileSync(sourceDbPath, tmpDbPath);
          }
        }

        if (fs.existsSync(tmpDbPath)) {
          targetDbPath = tmpDbPath;
        }
      } catch (e) {
        console.error("Error configuring writable temp database:", e);
      }
    }

    const adapter = new PrismaBetterSqlite3({ url: targetDbPath });
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
