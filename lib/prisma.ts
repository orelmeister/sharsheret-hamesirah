import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  // Cache unconditionally (dev AND production) on globalThis so the whole
  // Node process shares ONE PrismaClient → ONE connection pool. Next.js App
  // Router loads route bundles in separate module registries, but globalThis
  // is process-wide, so this stays a true singleton across all bundles.
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }
  return globalForPrisma.prisma;
}

/** Lazy singleton — doesn't connect until first use */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    return (client as any)[prop];
  },
});
