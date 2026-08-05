import { prisma } from './db';

export async function getPollResults(pollId: string) {
  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: {
      options: {
        include: {
          _count: { select: { votes: true } }
        }
      },
      _count: { select: { votes: true } }
    }
  });

  if (!poll) return null;

  const totalVotes = poll._count.votes;
  const results = poll.options.map(opt => {
    const optionVotes = opt._count.votes;
    const percentage = totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0;
    return {
      optionId: opt.id,
      text: opt.text,
      imageUrl: opt.imageUrl,
      votes: optionVotes,
      percentage: Math.round(percentage * 100) / 100
    };
  });

  return {
    pollId: poll.id,
    title: poll.title,
    totalVotes,
    results,
    closed: poll.closed,
    createdAt: poll.createdAt,
    expiresAt: poll.expiresAt,
    isPrivate: poll.isPrivate,
    hasPin: Boolean(poll.pinCode && poll.pinCode.trim().length > 0)
  };
}
