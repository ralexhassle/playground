/**
 * User Management Routes
 * Demonstrates Drizzle ORM usage with modern error handling
 */

import { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { users } from '../db/schema';
import { hashPassword } from '../utils/auth';
import { authenticate } from '../utils/authenticate';
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from '../constants';

export async function userRoutes(fastify: FastifyInstance) {
  // GET /api/users - List all users
  fastify.get(
    '/api/users',
    { preHandler: [authenticate] },
    async (request, reply) => {
      try {
        const allUsers = await db.select().from(users);
        return reply.code(HTTP_STATUS.OK).send(allUsers);
      } catch (error) {
        request.log.error(error);
        return reply
          .code(HTTP_STATUS.INTERNAL_SERVER_ERROR)
          .send({ error: ERROR_MESSAGES.DATABASE_ERROR });
      }
    }
  );

  // GET /api/users/:id - Get user by ID
  fastify.get(
    '/api/users/:id',
    { preHandler: [authenticate] },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, id))
          .limit(1);

        if (user.length === 0) {
          return reply
            .code(HTTP_STATUS.NOT_FOUND)
            .send({ error: ERROR_MESSAGES.USER_NOT_FOUND });
        }

        return reply.code(HTTP_STATUS.OK).send(user[0]);
      } catch (error) {
        request.log.error(error);
        return reply
          .code(HTTP_STATUS.INTERNAL_SERVER_ERROR)
          .send({ error: ERROR_MESSAGES.DATABASE_ERROR });
      }
    }
  );

  // POST /api/users - Create new user
  fastify.post(
    '/api/users',
    { preHandler: [authenticate] },
    async (request, reply) => {
      try {
        const body = request.body as {
          email: string;
          name: string;
          password: string;
        };

        const newUser = await db
          .insert(users)
          .values({
            email: body.email,
            name: body.name,
            passwordHash: hashPassword(body.password),
          })
          .returning();

        return reply.code(HTTP_STATUS.CREATED).send(newUser[0]);
      } catch (error) {
        request.log.error(error);
        return reply
          .code(HTTP_STATUS.INTERNAL_SERVER_ERROR)
          .send({ error: ERROR_MESSAGES.DATABASE_ERROR });
      }
    }
  );

  // PUT /api/users/:id - Update user
  fastify.put(
    '/api/users/:id',
    { preHandler: [authenticate] },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const body = request.body as { name?: string; email?: string };

        // Check if user exists
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.id, id))
          .limit(1);
        if (existingUser.length === 0) {
          return reply
            .code(HTTP_STATUS.NOT_FOUND)
            .send({ error: ERROR_MESSAGES.USER_NOT_FOUND });
        }

        // Update with new data
        const updateData = { ...body, updatedAt: new Date() };
        const updatedUser = await db
          .update(users)
          .set(updateData)
          .where(eq(users.id, id))
          .returning();

        return reply.code(HTTP_STATUS.OK).send(updatedUser[0]);
      } catch (error) {
        request.log.error(error);
        return reply
          .code(HTTP_STATUS.INTERNAL_SERVER_ERROR)
          .send({ error: ERROR_MESSAGES.DATABASE_ERROR });
      }
    }
  );

  // DELETE /api/users/:id - Delete user
  fastify.delete(
    '/api/users/:id',
    { preHandler: [authenticate] },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };

        const deletedUser = await db
          .delete(users)
          .where(eq(users.id, id))
          .returning();

        if (deletedUser.length === 0) {
          return reply
            .code(HTTP_STATUS.NOT_FOUND)
            .send({ error: ERROR_MESSAGES.USER_NOT_FOUND });
        }

        return reply
          .code(HTTP_STATUS.OK)
          .send({ message: SUCCESS_MESSAGES.USER_DELETED });
      } catch (error) {
        request.log.error(error);
        return reply
          .code(HTTP_STATUS.INTERNAL_SERVER_ERROR)
          .send({ error: ERROR_MESSAGES.DATABASE_ERROR });
      }
    }
  );
}
