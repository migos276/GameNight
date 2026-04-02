import prisma from "../../utils/prisma";
import { AppError } from "../../middlewares/errorHandler";
import { CreateEventInput, UpdateEventInput, ProposeGameInput } from "./events.schema";

const eventWithDetails = {
  host: { select: { id: true, name: true, email: true } },
  members: {
    include: { user: { select: { id: true, name: true, email: true } } },
  },
  games: {
    include: {
      proposedBy: { select: { id: true, name: true } },
      votes: { select: { userId: true } },
      _count: { select: { votes: true } },
    },
  },
  winningGame: { select: { id: true, name: true } },
};

export const listEvents = async () => {
  return prisma.event.findMany({
    orderBy: { date: "asc" },
    include: {
      host: { select: { id: true, name: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      _count: { select: { members: true, games: true } },
    },
  });
};

export const getEvent = async (id: string) => {
  const event = await prisma.event.findUnique({
    where: { id },
    include: eventWithDetails,
  });
  if (!event) throw new AppError("Event not found", 404);
  return event;
};

export const createEvent = async (input: CreateEventInput, hostId: string) => {
  return prisma.event.create({
    data: { ...input, date: new Date(input.date), hostId },
    include: eventWithDetails,
  });
};

export const updateEvent = async (
  id: string,
  input: UpdateEventInput,
  userId: string
) => {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new AppError("Event not found", 404);
  if (event.hostId !== userId) throw new AppError("Forbidden", 403);

  return prisma.event.update({
    where: { id },
    data: { ...input, date: input.date ? new Date(input.date) : undefined },
    include: eventWithDetails,
  });
};

export const deleteEvent = async (id: string, userId: string) => {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new AppError("Event not found", 404);
  if (event.hostId !== userId) throw new AppError("Forbidden", 403);
  await prisma.event.delete({ where: { id } });
};

export const joinEvent = async (eventId: string, userId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { _count: { select: { members: true } } },
  });
  if (!event) throw new AppError("Event not found", 404);

  const alreadyMember = await prisma.eventMember.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (alreadyMember) throw new AppError("Already joined this event", 409);

  if (event.maxParticipants && event._count.members >= event.maxParticipants) {
    throw new AppError("Event is full", 409);
  }

  return prisma.eventMember.create({ data: { userId, eventId } });
};

export const leaveEvent = async (eventId: string, userId: string) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError("Event not found", 404);
  if (event.hostId === userId) throw new AppError("Host cannot leave the event", 400);

  const membership = await prisma.eventMember.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (!membership) throw new AppError("Not a member of this event", 404);

  await prisma.eventMember.delete({
    where: { userId_eventId: { userId, eventId } },
  });
};

export const confirmEvent = async (eventId: string, userId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      games: { include: { _count: { select: { votes: true } } } },
    },
  });
  if (!event) throw new AppError("Event not found", 404);
  if (event.hostId !== userId) throw new AppError("Forbidden", 403);
  if (event.games.length === 0)
    throw new AppError("Event must have at least one game proposal", 400);

  // Find winning game (most votes)
  const winner = event.games.reduce((prev, curr) =>
    curr._count.votes > prev._count.votes ? curr : prev
  );

  return prisma.event.update({
    where: { id: eventId },
    data: { status: "CONFIRMED", winningGameId: winner.id },
    include: eventWithDetails,
  });
};

export const proposeGame = async (
  eventId: string,
  input: ProposeGameInput,
  userId: string
) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError("Event not found", 404);
  if (event.status !== "PLANNED") throw new AppError("Event is not in PLANNED status", 400);

  return prisma.gameProposal.create({
    data: { name: input.name, eventId, proposedById: userId },
    include: {
      proposedBy: { select: { id: true, name: true } },
      _count: { select: { votes: true } },
    },
  });
};
