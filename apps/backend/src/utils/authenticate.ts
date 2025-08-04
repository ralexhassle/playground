import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from './auth';

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const header = request.headers['authorization'];
  if (!header) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
  const token = header.replace('Bearer ', '');
  const payload = verifyToken(token, process.env.JWT_SECRET || 'secret');
  if (!payload) {
    return reply.code(401).send({ error: 'Invalid token' });
  }
  (request as any).user = payload;
}
