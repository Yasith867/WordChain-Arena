import type { Express } from "express";
import type { Server } from "http";

import { api } from "../shared/routes.js";
import { storage } from "./storage.js";

/**
 * Register ALL backend API routes here.
 * These must be registered BEFORE Vite middleware.
 */
export async function registerRoutes(
  httpServer: Server,
  app: Express,
) {
  // =========================
  // HEALTH CHECK (OPTIONAL BUT RECOMMENDED)
  // =========================
  app.get("/api", (_req, res) => {
    res.json({ status: "ok" });
  });

  // =========================
  // USERS
  // =========================
  app.post(api.users.create.path, async (req, res) => {
    try {
      const input = api.users.create.input.parse(req.body);
      const user = await storage.createUser(input.username);
      res.status(201).json(user);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // =========================
  // GAMES
  // =========================
  app.post(api.games.create.path, async (req, res) => {
    try {
      const input = api.games.create.input.parse(req.body);
      const game = await storage.createGame(
        input.hostId,
        input.isBotGame,
      );
      res.status(201).json(game);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.post(api.games.join.path, async (req, res) => {
    try {
      const gameId = req.params.id;
      const input = api.games.join.input.parse(req.body);
      const game = await storage.joinGame(gameId, input.userId);
      res.json(game);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.get(api.games.get.path, async (req, res) => {
    try {
      const gameId = req.params.id;
      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.post(api.games.start.path, async (req, res) => {
    try {
      const gameId = req.params.id;
      await storage.startGame(gameId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.post(api.games.submitWord.path, async (req, res) => {
    try {
      const gameId = req.params.id;
      const input = api.games.submitWord.input.parse(req.body);

      const result = await storage.submitWord(
        gameId,
        input.userId,
        input.word,
      );

      if (!result.valid) {
        return res.status(400).json({ message: result.message });
      }

      res.json({
        success: true,
        points: result.points ?? 1,
      });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.post(api.games.leave.path, async (req, res) => {
    try {
      const gameId = req.params.id;
      const { userId } = req.body;
      await storage.leaveGame(gameId, userId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  return httpServer;
}
