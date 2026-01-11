# Word Chain Rush

## Overview

Word Chain Rush is a real-time multiplayer word association game built with React, TypeScript, and Express. Players compete in fast-paced rounds where each word must start with the last letter of the previous word. The game supports 2-4 players, runs for 5 rounds with 5-second timers per round, and includes optional bot opponents.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, bundled via Vite
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state, localStorage for user persistence
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for game state transitions and UI effects
- **UI Components**: Radix UI primitives wrapped with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod validation
- **Storage**: Abstracted via `IStorage` interface in `server/storage.ts`, currently using in-memory storage (`MemStorage`) but designed for easy database swap

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Defined in `shared/schema.ts` with three main tables: users, games, players
- **Validation**: Drizzle-zod for automatic schema-to-validation generation

### Shared Code
- The `shared/` directory contains code used by both frontend and backend
- API route definitions with input/output schemas in `shared/routes.ts`
- Database schema and TypeScript types in `shared/schema.ts`

### Build System
- Development: Vite dev server with HMR proxied through Express
- Production: Vite builds frontend to `dist/public`, esbuild bundles server to `dist/index.cjs`
- Custom build script in `script/build.ts` handles both steps

## External Dependencies

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migrations stored in `./migrations`

### Key NPM Packages
- `express`: HTTP server framework
- `drizzle-orm` + `pg`: Database connectivity
- `@tanstack/react-query`: Async state management
- `framer-motion`: Animation library
- `canvas-confetti`: Victory celebration effects
- `zod`: Runtime type validation
- `wouter`: Client-side routing

### Replit Integrations
- `@replit/vite-plugin-runtime-error-modal`: Error overlay in development
- `@replit/vite-plugin-cartographer`: Development tooling
- `@replit/vite-plugin-dev-banner`: Development environment indicator