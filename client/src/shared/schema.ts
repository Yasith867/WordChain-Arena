// client/src/shared/schema.ts
import { z } from "zod";

/* =========================
   Game schemas (CLIENT SAFE)
========================= */

export const createGameSchema = z.object({
  name: z.string().min(1),
});

export const joinGameSchema = z.object({
  gameId: z.string().uuid(),
  username: z.string().min(1),
});

export const submitWordSchema = z.object({
  gameId: z.string().uuid(),
  word: z.string().min(1),
});

/* =========================
   Inferred types
========================= */

export type CreateGameInput = z.infer<typeof createGameSchema>;
export type JoinGameInput = z.infer<typeof joinGameSchema>;
export type SubmitWordInput = z.infer<typeof submitWordSchema>;
