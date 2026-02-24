import { getSession } from './session';
import { getUserById } from './data';

export async function getCurrentUser() {
  const userId = await getSession();
  if (!userId) return null;
  
  return getUserById(userId);
}

export async function requireAuth() {
  const userId = await getSession();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}

