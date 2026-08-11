import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;

if (typeof window === "undefined") {
  if (!globalForPrisma.prisma) {
    const connectionString = process.env.DATABASE_URL;
    if (connectionString && (connectionString.startsWith("postgres") || connectionString.startsWith("postgresql"))) {
      const pool = new pg.Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
      });
      const adapter = new PrismaPg(pool);
      globalForPrisma.prisma = new PrismaClient({ adapter });
    } else {
      globalForPrisma.prisma = new PrismaClient();
    }
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
