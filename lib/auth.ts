import { getSession } from './session';
import { prisma } from './db';

export async function getCurrentUser() {
  const userId = await getSession();
  if (!userId) return null;
  
  return prisma.user.findUnique({
    where: { id: userId }
  });
}

export async function requireAuth() {
  const userId = await getSession();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}
