import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  date: z.string().datetime("Invalid date format"),
  location: z.string().min(2, "Location is required"),
  maxParticipants: z.coerce.number().int().positive().optional(),
  imageUrl: z.string().optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const proposeGameSchema = z.object({
  name: z.string().min(1, "Game name is required"),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type ProposeGameInput = z.infer<typeof proposeGameSchema>;
