import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@/shared/routes";
import type { GameState } from "@/shared/schema";

/**
 * Helper to handle API validation + errors
 */
async function handleResponse<T>(res: Response, schema: any): Promise<T> {
  if (!res.ok) {
    try {
      const error = await res.json();
      throw new Error(error.message || `Error ${res.status}`);
    } catch {
      throw new Error(`Request failed with status ${res.status}`);
    }
  }

  const data = await res.json();
  return schema.parse(data);
}

/* =========================
   USERS
========================= */

export function useCreateUser() {
  return useMutation({
    mutationFn: async (username: string) => {
      const res = await fetch(api.users.create.path, {
        method: api.users.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
        credentials: "include",
      });

      return handleResponse(res, api.users.create.responses[201]);
    },
  });
}

/* =========================
   GAMES
========================= */

export function useCreateGame() {
  return useMutation({
    mutationFn: async ({
      hostId,
      isBotGame,
    }: {
      hostId: number;
      isBotGame: boolean;
    }) => {
      const res = await fetch(api.games.create.path, {
        method: api.games.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostId, isBotGame }),
        credentials: "include",
      });

      return handleResponse(res, api.games.create.responses[201]);
    },
  });
}

export function useJoinGame() {
  return useMutation({
    mutationFn: async ({
      gameId,
      userId,
    }: {
      gameId: string;
      userId: number;
    }) => {
      const url = buildUrl(api.games.join.path, { id: gameId });

      const res = await fetch(url, {
        method: api.games.join.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
        credentials: "include",
      });

      return handleResponse(res, api.games.join.responses[200]);
    },
  });
}

export function useGame(gameId: string | null) {
  return useQuery({
    queryKey: ["game", gameId],
    enabled: Boolean(gameId),
    refetchInterval: 500, // realtime feel
    queryFn: async () => {
      if (!gameId) {
        throw new Error("No game ID provided");
      }

      const url = buildUrl(api.games.get.path, { id: gameId });
      const res = await fetch(url, { credentials: "include" });

      return handleResponse<GameState>(
        res,
        api.games.get.responses[200]
      );
    },
  });
}

export function useStartGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gameId: string) => {
      const url = buildUrl(api.games.start.path, { id: gameId });

      const res = await fetch(url, {
        method: api.games.start.method,
        credentials: "include",
      });

      return handleResponse(res, api.games.start.responses[200]);
    },
    onSuccess: (_, gameId) => {
      queryClient.invalidateQueries({ queryKey: ["game", gameId] });
    },
  });
}

export function useSubmitWord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gameId,
      userId,
      word,
    }: {
      gameId: string;
      userId: number;
      word: string;
    }) => {
      const url = buildUrl(api.games.submitWord.path, { id: gameId });

      const res = await fetch(url, {
        method: api.games.submitWord.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, word }),
        credentials: "include",
      });

      return handleResponse(res, api.games.submitWord.responses[200]);
    },
    onSuccess: (_, { gameId }) => {
      queryClient.invalidateQueries({ queryKey: ["game", gameId] });
    },
  });
}
