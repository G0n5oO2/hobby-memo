import { PrismaClient } from "@prisma/client";

// Vercel Functions はリクエストごとに再実行され得るため、
// グローバルにキャッシュして接続を使い回す（開発時のホットリロード対策も兼ねる）。
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}
