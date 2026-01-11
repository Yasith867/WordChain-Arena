import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Users
  app.post(api.users.create.path, async (req, res) => {
    try {
      const input = api.users.create.input.parse(req.body);
      const user = await storage.createUser(input);
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Games
  app.post(api.games.create.path, async (req, res) => {
    try {
      const input = api.games.create.input.parse(req.body);
      const game = await storage.createGame(input.hostId, input.isBotGame);
      res.status(201).json({ gameId: game.id });
    } catch (err) {
       res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.games.join.path, async (req, res) => {
    try {
      const input = api.games.join.input.parse(req.body);
      const gameId = req.params.id;
      const player = await storage.joinGame(gameId, input.userId);
      res.json(player);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.get(api.games.get.path, async (req, res) => {
    const gameId = req.params.id;
    const game = await storage.getGame(gameId);
    if (!game) return res.status(404).json({ message: "Game not found" });
    res.json(game);
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
      const input = api.games.submitWord.input.parse(req.body);
      const gameId = req.params.id;
      const result = await storage.submitWord(gameId, input.userId, input.word);
      if (!result.valid) {
        return res.status(400).json({ message: result.message });
      }
      res.json({ success: true, points: 1 });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  return httpServer;
}
