import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Use Accelerate connection string in production, normal DB locally
const databaseUrl =
  process.env.NODE_ENV === 'production'
    ? process.env.ACCELERATE_DATABASE_URL || process.env.DATABASE_URL
    : process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL (or ACCELERATE_DATABASE_URL in production) is not set. Please copy `.env.example` to `.env` and set your database connection string.'
  );
}

// Extend globalThis to include prisma
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma || new PrismaClient({ datasources: { db: { url: databaseUrl } } });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
