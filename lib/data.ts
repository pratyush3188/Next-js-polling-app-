// Simple in-memory data store
// In production, this would be a database

export interface User {
  id: string;
  username: string;
  passkeyId: string;
  passkeyPublicKey: string;
  createdAt: Date;
}

export interface Poll {
  id: string;
  title: string;
  options: PollOption[];
  creatorId: string;
  createdAt: Date;
  closed: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Vote {
  pollId: string;
  optionId: string;
  userId: string;
  createdAt: Date;
}

// In-memory stores
export const users: User[] = [];
export const polls: Poll[] = [];
export const votes: Vote[] = [];

// Challenge storage for WebAuthn (simple in-memory store)
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

// Helper functions
export function getPollById(pollId: string): Poll | undefined {
  return polls.find(p => p.id === pollId);
}

export function getUserById(userId: string): User | undefined {
  return users.find(u => u.id === userId);
}

export function getUserByPasskeyId(passkeyId: string): User | undefined {
  // Try direct match first
  const directMatch = users.find(u => u.passkeyId === passkeyId);
  if (directMatch) return directMatch;
  
  // Try matching by converting between base64 and base64url
  for (const u of users) {
    try {
      // Convert stored base64 to base64url and compare
      const storedBase64url = Buffer.from(u.passkeyId, 'base64').toString('base64url');
      if (storedBase64url === passkeyId) return u;
      
      // Convert input to base64 and compare
      const inputBase64 = Buffer.from(passkeyId, 'base64url').toString('base64');
      if (inputBase64 === u.passkeyId) return u;
    } catch {
      // Continue if conversion fails
    }
  }
  
  return undefined;
}

export function getVotesForPoll(pollId: string): Vote[] {
  return votes.filter(v => v.pollId === pollId);
}

export function hasUserVoted(pollId: string, userId: string): boolean {
  return votes.some(v => v.pollId === pollId && v.userId === userId);
}

export function getPollResults(pollId: string) {
  const poll = getPollById(pollId);
  if (!poll) return null;

  const pollVotes = getVotesForPoll(pollId);
  const totalVotes = pollVotes.length;

  const results = poll.options.map(option => {
    const optionVotes = pollVotes.filter(v => v.optionId === option.id).length;
    const percentage = totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0;
    
    return {
      optionId: option.id,
      text: option.text,
      votes: optionVotes,
      percentage: Math.round(percentage * 100) / 100
    };
  });

  return {
    pollId,
    title: poll.title,
    totalVotes,
    results,
    closed: poll.closed,
    createdAt: poll.createdAt
  };
}

