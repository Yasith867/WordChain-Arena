import { 
  users, games, players, 
  type User, type Game, type Player, type GameState,
  type InsertUser 
} from "@shared/schema";

export interface IStorage {
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  
  createGame(hostId: number, isBotGame: boolean): Promise<Game>;
  getGame(id: string): Promise<GameState | undefined>;
  joinGame(gameId: string, userId: number): Promise<Player>;
  startGame(gameId: string): Promise<void>;
  submitWord(gameId: string, userId: number, word: string): Promise<{valid: boolean, message?: string}>;
  processBotMove(gameId: string): Promise<void>; // For Alice
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private games: Map<string, Game>;
  private players: Map<number, Player>; // player id -> player
  private gamePlayers: Map<string, number[]>; // gameId -> playerIds
  private userIdCounter = 1;
  private playerIdCounter = 1;

  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.players = new Map();
    this.gamePlayers = new Map();
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createGame(hostId: number, isBotGame: boolean): Promise<Game> {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    const game: Game = {
      id,
      hostId,
      status: 'waiting',
      round: 0,
      currentWord: '',
      roundEndsAt: null,
      isBotGame
    };
    this.games.set(id, game);
    this.gamePlayers.set(id, []);
    
    // Auto-join host
    await this.joinGame(id, hostId);

    if (isBotGame) {
      // Create Alice bot if not exists
      // For simplicity, we just add a "bot" player
      // We'll treat userId -1 as Alice
      const botPlayer: Player = {
        id: this.playerIdCounter++,
        gameId: id,
        userId: -1,
        score: 0,
        hasSubmitted: false
      };
      this.players.set(botPlayer.id, botPlayer);
      this.gamePlayers.get(id)?.push(botPlayer.id);
    }

    return game;
  }

  async getGame(id: string): Promise<GameState | undefined> {
    const game = this.games.get(id);
    if (!game) return undefined;

    // Check timeouts if playing
    if (game.status === 'playing' && game.roundEndsAt && new Date() > game.roundEndsAt) {
      await this.endRound(game);
    }

    // Bot logic hook (simple poll-based simulation)
    if (game.status === 'playing' && game.isBotGame) {
      await this.processBotMove(id);
    }

    const playerIds = this.gamePlayers.get(id) || [];
    const gamePlayersList = playerIds.map(pid => this.players.get(pid)!).filter(Boolean);
    
    const playersWithNames = gamePlayersList.map(p => {
      let username = "Unknown";
      if (p.userId === -1) username = "Alice (Bot)";
      else {
        const u = this.users.get(p.userId);
        if (u) username = u.username;
      }
      return { ...p, username };
    });

    return { ...game, players: playersWithNames };
  }

  async joinGame(gameId: string, userId: number): Promise<Player> {
    const game = this.games.get(gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== 'waiting') throw new Error("Game already started");
    
    const playerIds = this.gamePlayers.get(gameId) || [];
    if (playerIds.length >= 4) throw new Error("Game full");

    // Check if already joined
    const existing = playerIds.find(pid => this.players.get(pid)?.userId === userId);
    if (existing) return this.players.get(existing)!;

    const player: Player = {
      id: this.playerIdCounter++,
      gameId,
      userId,
      score: 0,
      hasSubmitted: false
    };
    this.players.set(player.id, player);
    playerIds.push(player.id);
    this.gamePlayers.set(gameId, playerIds); // ensure ref

    return player;
  }

  async startGame(gameId: string): Promise<void> {
    const game = this.games.get(gameId);
    if (!game) throw new Error("Game not found");
    
    // Start countdown or go straight to round 1 (Requirement: 5s countdown page, backend can just set to playing or countdown)
    // We'll set to playing immediately, frontend handles visual countdown before calling start? 
    // Or we have a 'countdown' status.
    // Let's go with round 1 immediately for simplicity of backend logic, frontend manages the "5,4,3,2,1" transition then calls start.
    
    const startWords = ["APPLE", "TIGER", "RIVER", "CLOUD", "MUSIC", "GHOST", "LEMON", "PIZZA"];
    const word = startWords[Math.floor(Math.random() * startWords.length)];

    game.status = 'playing';
    game.round = 1;
    game.currentWord = word;
    game.roundEndsAt = new Date(Date.now() + 5000); // 5 seconds
    this.games.set(gameId, game);
  }

  async submitWord(gameId: string, userId: number, word: string): Promise<{valid: boolean, message?: string}> {
    const game = this.games.get(gameId);
    if (!game) return { valid: false, message: "Game not found" };
    if (game.status !== 'playing') return { valid: false, message: "Round not active" };
    
    const lastChar = game.currentWord.slice(-1).toUpperCase();
    const firstChar = word.trim().charAt(0).toUpperCase();

    if (firstChar !== lastChar) {
      return { valid: false, message: `Word must start with '${lastChar}'` };
    }

    // Winner!
    const playerIds = this.gamePlayers.get(gameId) || [];
    const player = playerIds.map(pid => this.players.get(pid)).find(p => p?.userId === userId);
    
    if (player) {
      player.score += 1;
      this.players.set(player.id, player);
    }

    // Advance round
    await this.endRound(game, word.toUpperCase());
    return { valid: true };
  }

  private async endRound(game: Game, winningWord?: string) {
    if (game.round >= 5) {
      game.status = 'finished';
      game.roundEndsAt = null;
    } else {
      game.round += 1;
      // If someone won, use their word. If timeout, pick random new word.
      if (winningWord) {
        game.currentWord = winningWord;
      } else {
        const backupWords = ["STORM", "BREAD", "NIGHT", "DREAM", "FLAME"];
        game.currentWord = backupWords[Math.floor(Math.random() * backupWords.length)];
      }
      game.roundEndsAt = new Date(Date.now() + 5000);
    }
    this.games.set(game.id, game);
  }

  async processBotMove(gameId: string) {
    const game = this.games.get(gameId);
    if (!game || game.status !== 'playing' || !game.isBotGame) return;

    // Bot reacts after ~2 seconds into the round
    const timeLeft = game.roundEndsAt ? game.roundEndsAt.getTime() - Date.now() : 0;
    if (timeLeft < 3000 && timeLeft > 1000) {
      // 30% chance to miss/be slow
      if (Math.random() > 0.3) {
        const lastChar = game.currentWord.slice(-1).toUpperCase();
        const botWord = lastChar + "BOTWORD"; // Simple valid word
        await this.submitWord(gameId, -1, botWord); // -1 is Alice
      }
    }
  }
}

export const storage = new MemStorage();
