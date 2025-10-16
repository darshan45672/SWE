import { prisma } from '@projectmanager/prisma-client';
import { Session } from '@projectmanager/prisma-client/src/generated';

/**
 * Session Repository - Data Access Layer
 * Handles all database operations for sessions
 */
export class SessionRepository {
  /**
   * Create a new session
   */
  async create(data: {
    userId: string;
    refreshToken: string;
    deviceInfo?: {
      userAgent: string;
      browser: string;
      os: string;
      device: string;
    };
    ipAddress?: string;
    expiresAt: Date;
  }): Promise<Session> {
    return prisma.session.create({
      data,
    });
  }

  /**
   * Find session by refresh token
   */
  async findByRefreshToken(refreshToken: string): Promise<(Session & { user: any }) | null> {
    return prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    }) as Promise<(Session & { user: any }) | null>;
  }

  /**
   * Delete session by refresh token
   */
  async deleteByRefreshToken(refreshToken: string): Promise<void> {
    await prisma.session.delete({
      where: { refreshToken },
    });
  }

  /**
   * Delete all sessions for a user
   */
  async deleteAllByUserId(userId: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { userId },
    });
  }

  /**
   * Delete expired sessions
   */
  async deleteExpired(): Promise<void> {
    await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
