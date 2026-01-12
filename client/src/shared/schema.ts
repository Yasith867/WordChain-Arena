import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users (Players)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
});

// Games
export const games = pgTable("games", {
  id: text("id").primaryKey(), // 6-char code
  hostId: integer("host_id").notNull(),
  status: text("status").notNull(), // 'waiting', 'countdown', 'playing', 'finished'
  round: integer("round").notNull().default(0),
  currentWord: text("current_word").notNull(),
  roundEndsAt: timestamp("round_ends_at"),
  isBotGame: boolean("is_bot_game").default(false),
});

// Players in a game
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  gameId: text("game_id").notNull(),
  userId: integer("user_id").notNull(),
  score: integer("score").default(0),
  hasSubmitted: boolean("has_submitted").default(false),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertGameSchema = createInsertSchema(games);
export const insertPlayerSchema = createInsertSchema(players);

export type User = typeof users.$inferSelect;
export type Game = typeof games.$inferSelect;
export type Player = typeof players.$inferSelect;

export type GameState = Game & {
  players: (Player & { username: string })[];
};

// API Types
export const createGameSchema = z.object({
  hostId: z.number(),
  isBotGame: z.boolean().default(false),
});

export const joinGameSchema = z.object({
  userId: z.number(),
});

export const submitWordSchema = z.object({
  userId: z.number(),
  word: z.string(),
});
