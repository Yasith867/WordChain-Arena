import {
  type User,
  type Game,
  type Player,
  type GameState,
  type InsertUser,
} from "@shared/schema";

export interface IStorage {
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;

  createGame(hostId: number, isBotGame: boolean): Promise<Game>;
  getGame(id: string): Promise<GameState | undefined>;
  joinGame(gameId: string, userId: number): Promise<Player>;
  startGame(gameId: string): Promise<void>;
  submitWord(
    gameId: string,
    userId: number,
    word: string,
  ): Promise<{ valid: boolean; message?: string; points?: number }>;
  leaveGame(gameId: string, userId: number): Promise<void>;
  processBotMove(gameId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users = new Map<number, User>();
  private games = new Map<string, Game>();
  private players = new Map<number, Player>();
  private gamePlayers = new Map<string, number[]>();

  private userIdCounter = 1;
  private playerIdCounter = 1;

  // =====================
  // USERS
  // =====================

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.userIdCounter++,
      username: insertUser.username,
    };
    this.users.set(user.id, user);
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  // =====================
  // GAMES
  // =====================

  async createGame(hostId: number, isBotGame: boolean): Promise<Game> {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();

    const game: Game = {
      id,
      hostId,
      status: "waiting",
      round: 0,
      currentWord: "",
      roundEndsAt: null,
      isBotGame,
    };

    this.games.set(id, game);
    this.gamePlayers.set(id, []);

    await this.joinGame(id, hostId);

    if (isBotGame) {
      const bot: Player = {
        id: this.playerIdCounter++,
        gameId: id,
        userId: -1,
        score: 0,
        hasSubmitted: false,
      };
      this.players.set(bot.id, bot);
      this.gamePlayers.get(id)!.push(bot.id);
    }

    return game;
  }

  async getGame(id: string): Promise<GameState | undefined> {
    const game = this.games.get(id);
    if (!game) return undefined;

    if (
      game.status === "playing" &&
      game.roundEndsAt &&
      Date.now() > game.roundEndsAt.getTime()
    ) {
      await this.endRound(game);
    }

    if (game.status === "playing" && game.isBotGame) {
      await this.processBotMove(id);
    }

    const players = (this.gamePlayers.get(id) || [])
      .map((pid) => this.players.get(pid))
      .filter(Boolean)
      .map((p) => ({
        ...p!,
        username:
          p!.userId === -1
            ? "Alice (Bot)"
            : this.users.get(p!.userId)?.username ?? "Unknown",
      }));

    return { ...game, players };
  }

  async joinGame(gameId: string, userId: number): Promise<Player> {
    const game = this.games.get(gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "waiting") throw new Error("Game already started");

    const playerIds = this.gamePlayers.get(gameId)!;
    if (playerIds.length >= 4) throw new Error("Game full");

    const existing = playerIds.find(
      (pid) => this.players.get(pid)?.userId === userId,
    );
    if (existing) return this.players.get(existing)!;

    const player: Player = {
      id: this.playerIdCounter++,
      gameId,
      userId,
      score: 0,
      hasSubmitted: false,
    };

    this.players.set(player.id, player);
    playerIds.push(player.id);
    return player;
  }

  async startGame(gameId: string): Promise<void> {
    const game = this.games.get(gameId);
    if (!game) throw new Error("Game not found");

    const words = ["APPLE", "TIGER", "RIVER", "CLOUD", "MUSIC"];
    game.status = "playing";
    game.round = 1;
    game.currentWord = words[Math.floor(Math.random() * words.length)];
    game.roundEndsAt = new Date(Date.now() + 5000);

    this.resetSubmissions(gameId);
  }

  async submitWord(
    gameId: string,
    userId: number,
    word: string,
  ): Promise<{ valid: boolean; message?: string; points?: number }> {
    const game = this.games.get(gameId);
    if (!game) return { valid: false, message: "Game not found" };
    if (game.status !== "playing")
      return { valid: false, message: "Round not active" };

    const lastChar = game.currentWord.slice(-1).toUpperCase();
    const firstChar = word.trim()[0]?.toUpperCase();

    if (firstChar !== lastChar) {
      return {
        valid: false,
        message: `Word must start with '${lastChar}'`,
      };
    }

    const player = this.findPlayer(gameId, userId);
    if (!player || player.hasSubmitted) {
      return { valid: false, message: "Already submitted" };
    }

    player.score += 1;
    player.hasSubmitted = true;

    await this.endRound(game, word.toUpperCase());
    return { valid: true, points: 1 };
  }

  async leaveGame(gameId: string, userId: number): Promise<void> {
    const ids = this.gamePlayers.get(gameId);
    if (!ids) return;

    const index = ids.findIndex(
      (pid) => this.players.get(pid)?.userId === userId,
    );
    if (index === -1) return;

    const pid = ids[index];
    this.players.delete(pid);
    ids.splice(index, 1);

    if (ids.length === 0) {
      this.games.delete(gameId);
      this.gamePlayers.delete(gameId);
    }
  }

  // =====================
  // HELPERS
  // =====================

  private findPlayer(gameId: string, userId: number) {
    return (this.gamePlayers.get(gameId) || [])
      .map((pid) => this.players.get(pid))
      .find((p) => p?.userId === userId);
  }

  private resetSubmissions(gameId: string) {
    for (const pid of this.gamePlayers.get(gameId) || []) {
      const p = this.players.get(pid);
      if (p) p.hasSubmitted = false;
    }
  }

  private async endRound(game: Game, nextWord?: string) {
    if (game.round >= 5) {
      game.status = "finished";
      game.roundEndsAt = null;
      return;
    }

    game.round++;
    game.currentWord =
      nextWord ??
      ["STORM", "BREAD", "NIGHT", "FLAME"][
        Math.floor(Math.random() * 4)
      ];
    game.roundEndsAt = new Date(Date.now() + 5000);
    this.resetSubmissions(game.id);
  }

  async processBotMove(gameId: string): Promise<void> {
    const game = this.games.get(gameId);
    if (!game || !game.isBotGame || game.status !== "playing") return;

    const bot = this.findPlayer(gameId, -1);
    if (!bot || bot.hasSubmitted) return;

    const timeLeft =
      game.roundEndsAt?.getTime()! - Date.now();
    if (timeLeft < 3000 && timeLeft > 1000 && Math.random() > 0.3) {
      const letter = game.currentWord.slice(-1);
      await this.submitWord(gameId, -1, letter + "BOT");
    }
  }
}

export const storage = new MemStorage();
