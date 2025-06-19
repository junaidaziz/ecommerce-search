import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Please copy `.env.example` to `.env` and set your database connection string.'
  );
}

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
