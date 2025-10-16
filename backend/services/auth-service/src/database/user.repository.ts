import { prisma } from '@projectmanager/prisma-client';
import { User } from '@projectmanager/prisma-client/src/generated';

/**
 * User Repository - Data Access Layer
 * Handles all database operations for users
 * Following Repository Pattern
 */
export class UserRepository {
  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new user
   */
  async create(data: {
    email: string;
    password: string;
    name?: string;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name || null,
      },
    });
  }

  /**
   * Update user
   */
  async update(
    id: string,
    data: Partial<{
      password: string;
      name: string;
      emailVerified: boolean;
      emailVerifyToken: string | null;
      twoFactorEnabled: boolean;
      twoFactorSecret: string | null;
      lastLoginAt: Date;
    }>
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Find user by email verify token
   */
  async findByEmailVerifyToken(token: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });
  }
}
