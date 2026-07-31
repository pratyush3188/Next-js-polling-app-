// WebAuthn Challenge storage (temporary in-memory store)
// This is perfectly fine to keep in-memory as challenges only last for a minute during login/register.
const challenges = new Map<string, string>();

export function storeChallenge(key: string, challenge: string) {
  challenges.set(key, challenge);
}

export function getChallenge(key: string): string | undefined {
  return challenges.get(key);
}

export function deleteChallenge(key: string) {
  challenges.delete(key);
}
