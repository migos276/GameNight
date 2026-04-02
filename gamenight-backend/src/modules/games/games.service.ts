import prisma from "../../utils/prisma";
import { AppError } from "../../middlewares/errorHandler";

export const voteForGame = async (gameProposalId: string, userId: string) => {
  const game = await prisma.gameProposal.findUnique({
    where: { id: gameProposalId },
    include: { event: true },
  });
  if (!game) throw new AppError("Game proposal not found", 404);
  if (game.event.status !== "PLANNED")
    throw new AppError("Voting is closed for this event", 400);

  const existing = await prisma.vote.findUnique({
    where: { userId_gameProposalId: { userId, gameProposalId } },
  });
  if (existing) throw new AppError("Already voted for this game", 409);

  return prisma.vote.create({
    data: { userId, gameProposalId },
  });
};

export const removeVote = async (gameProposalId: string, userId: string) => {
  const game = await prisma.gameProposal.findUnique({
    where: { id: gameProposalId },
    include: { event: true },
  });
  if (!game) throw new AppError("Game proposal not found", 404);
  if (game.event.status !== "PLANNED")
    throw new AppError("Voting is closed for this event", 400);

  const vote = await prisma.vote.findUnique({
    where: { userId_gameProposalId: { userId, gameProposalId } },
  });
  if (!vote) throw new AppError("Vote not found", 404);

  await prisma.vote.delete({
    where: { userId_gameProposalId: { userId, gameProposalId } },
  });
};
