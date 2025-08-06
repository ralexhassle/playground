import { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { users } from '../db/schema';
import { verifyPassword, signToken, hashPassword } from '../utils/auth';
import type {
  LoginRequest,
  LoginResponse,
  CreateUserRequest,
  User,
} from '@/types';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';

export async function authRoutes(fastify: FastifyInstance) {
  // POST /api/auth/login - User authentication
  fastify.post<{ Body: LoginRequest; Reply: LoginResponse }>(
    '/api/auth/login',
    async (request, reply) => {
      const { email, password } = request.body;
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (user.length === 0) {
        return reply
          .code(HTTP_STATUS.UNAUTHORIZED)
          .send({
            success: false,
            message: ERROR_MESSAGES.INVALID_CREDENTIALS,
          });
      }

      const valid = verifyPassword(password, user[0].passwordHash);
      if (!valid) {
        return reply
          .code(HTTP_STATUS.UNAUTHORIZED)
          .send({
            success: false,
            message: ERROR_MESSAGES.INVALID_CREDENTIALS,
          });
      }

      const token = signToken(
        { id: user[0].id, email: user[0].email },
        process.env.JWT_SECRET || 'secret'
      );

      return reply.send({
        success: true,
        token,
        user: {
          id: user[0].id,
          name: user[0].name,
          email: user[0].email,
          createdAt: user[0].createdAt,
        },
      });
    }
  );

  // POST /api/auth/register - Create new user
  fastify.post<{
    Body: CreateUserRequest;
    Reply:
      | Pick<User, 'id' | 'name' | 'email' | 'createdAt' | 'updatedAt'>
      | { success: false; message: string };
  }>('/api/auth/register', async (request, reply) => {
    const { email, name, password } = request.body;

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return reply
        .code(HTTP_STATUS.CONFLICT)
        .send({ success: false, message: ERROR_MESSAGES.USER_ALREADY_EXISTS });
    }

    // Hash password
    const passwordHash = hashPassword(password);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        email,
        name,
        passwordHash,
      })
      .returning();

    // Return created user (without password hash)
    const userResponse = {
      id: newUser[0].id,
      name: newUser[0].name,
      email: newUser[0].email,
      createdAt: newUser[0].createdAt,
      updatedAt: newUser[0].updatedAt,
    };
    return reply.code(HTTP_STATUS.CREATED).send(userResponse);
  });
}
