import { z } from "zod";
import {
  createGameSchema,
  joinGameSchema,
  submitWordSchema,
} from "./schema";

/* =========================
   Error schemas
========================= */

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

/* =========================
   Client-safe response schemas
   (NO drizzle, NO pg-core)
========================= */

const userResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
});

const playerResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
  score: z.number().optional(),
});

/* =========================
   API contract
========================= */

export const api = {
  users: {
    create: {
      method: "POST" as const,
      path: "/api/users",
      input: z.object({ username: z.string() }),
      responses: {
        201: userResponseSchema,
        400: errorSchemas.validation,
      },
    },
  },

  games: {
    create: {
      method: "POST" as const,
      path: "/api/games",
      input: createGameSchema,
      responses: {
        201: z.object({ gameId: z.string() }),
        400: errorSchemas.validation,
      },
    },

    join: {
      method: "POST" as const,
      path: "/api/games/:id/join",
      input: joinGameSchema,
      responses: {
        200: playerResponseSchema,
        404: errorSchemas.notFound,
        400: errorSchemas.validation,
      },
    },

    get: {
      method: "GET" as const,
      path: "/api/games/:id",
      responses: {
        200: z.any(), // complex GameState
        404: errorSchemas.notFound,
      },
    },

    start: {
      method: "POST" as const,
      path: "/api/games/:id/start",
      responses: {
        200: z.object({ success: z.boolean() }),
        404: errorSchemas.notFound,
      },
    },

    submitWord: {
      method: "POST" as const,
      path: "/api/games/:id/word",
      input: submitWordSchema,
      responses: {
        200: z.object({
          success: z.boolean(),
          message: z.string().optional(),
        }),
        400: errorSchemas.validation,
      },
    },

    leave: {
      method: "POST" as const,
      path: "/api/games/:id/leave",
      input: z.object({ userId: z.number() }),
      responses: {
        200: z.object({ success: z.boolean() }),
        404: errorSchemas.notFound,
      },
    },
  },
};

/* =========================
   URL helper
========================= */

export function buildUrl(
  path: string,
  params?: Record<string, string | number>
): string {
  let url = path;

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }

  return url;
}
