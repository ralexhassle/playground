/**
 * Routes pour la gestion des utilisateurs
 * Démonstration de l'utilisation de Drizzle ORM
 */

import { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { users } from '../db/schema';
import { hashPassword } from '../utils/auth';
import { authenticate } from '../utils/authenticate';

export async function userRoutes(fastify: FastifyInstance) {
  // GET /api/users - Lister tous les utilisateurs
  fastify.get('/api/users', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const allUsers = await db.select().from(users);
      return reply.code(200).send(allUsers);
    } catch (error) {
      request.log.error(error);
      return reply
        .code(500)
        .send({ error: 'Erreur lors de la récupération des utilisateurs' });
    }
  });

  // GET /api/users/:id - Récupérer un utilisateur par ID
  fastify.get('/api/users/:id', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (user.length === 0) {
        return reply.code(404).send({ error: 'Utilisateur non trouvé' });
      }

      return reply.code(200).send(user[0]);
    } catch (error) {
      request.log.error(error);
      return reply
        .code(500)
        .send({ error: "Erreur lors de la récupération de l'utilisateur" });
    }
  });

  // POST /api/users - Créer un nouvel utilisateur
  fastify.post('/api/users', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const body = request.body as { email: string; name: string; password: string };

      const newUser = await db
        .insert(users)
        .values({
          email: body.email,
          name: body.name,
          passwordHash: hashPassword(body.password),
        })
        .returning();

      return reply.code(201).send(newUser[0]);
    } catch (error) {
      request.log.error(error);
      return reply
        .code(500)
        .send({ error: "Erreur lors de la création de l'utilisateur" });
    }
  });

  // PUT /api/users/:id - Mettre à jour un utilisateur
  fastify.put('/api/users/:id', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as { name?: string; email?: string };

      // Vérifier si l'utilisateur existe
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      if (existingUser.length === 0) {
        return reply.code(404).send({ error: 'Utilisateur non trouvé' });
      }

      // Mettre à jour avec les nouvelles données
      const updateData = { ...body, updatedAt: new Date() };
      const updatedUser = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();

      return reply.code(200).send(updatedUser[0]);
    } catch (error) {
      request.log.error(error);
      return reply
        .code(500)
        .send({ error: "Erreur lors de la mise à jour de l'utilisateur" });
    }
  });

  // DELETE /api/users/:id - Supprimer un utilisateur
  fastify.delete('/api/users/:id', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const deletedUser = await db
        .delete(users)
        .where(eq(users.id, id))
        .returning();

      if (deletedUser.length === 0) {
        return reply.code(404).send({ error: 'Utilisateur non trouvé' });
      }

      return reply
        .code(200)
        .send({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
      request.log.error(error);
      return reply
        .code(500)
        .send({ error: "Erreur lors de la suppression de l'utilisateur" });
    }
  });
}
