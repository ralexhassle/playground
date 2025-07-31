import { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { users } from '../db/schema';
import { verifyPassword, signToken } from '../utils/auth';
import type { LoginRequest, LoginResponse } from '@/types';

export async function authRoutes(fastify: FastifyInstance) {
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
        return reply.code(401).send({ error: 'Invalid credentials' } as any);
      }
      const valid = verifyPassword(password, user[0].passwordHash);
      if (!valid) {
        return reply.code(401).send({ error: 'Invalid credentials' } as any);
      }
      const token = signToken(
        { id: user[0].id, email: user[0].email },
        process.env.JWT_SECRET || 'secret'
      );
      return reply.send({ token });
    }
  );
}
