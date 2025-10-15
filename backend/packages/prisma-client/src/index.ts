import { PrismaClient } from './generated';

/**
 * Prisma Client singleton instance
 * This ensures we only have one instance of PrismaClient throughout the application
 * which is important for connection pooling and performance
 */

// Extend the NodeJS global type to include prisma
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
} else {
  // In development, use a global variable to preserve the client across hot reloads
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.__prisma;
}

/**
 * Gracefully disconnect on application shutdown
 */
const disconnect = async (): Promise<void> => {
  await prisma.$disconnect();
};

process.on('beforeExit', disconnect);
process.on('SIGINT', disconnect);
process.on('SIGTERM', disconnect);

export { prisma, disconnect };

// Export Prisma namespace for types
export { Prisma } from './generated';
