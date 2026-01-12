# Real-Time Word Chain Game (Linera-ready)

## Overview
This project is a real-time multiplayer word-chain game inspired by fast turn-based party games.
Players must submit a word that starts with the last letter of the previous word within a strict time limit.

The project is designed for **Linera’s real-time microchain architecture**, with a clear separation between
on-chain game state and off-chain UI/AI logic.

---

## Gameplay Rules
- Min players: 2 (host + 1)
- Max players: 4
- Total rounds: 5
- Each player has **5 seconds** to answer on their turn
- Word must start with the **last letter** of the previous word
- Correct answer: +1 point
- Timeout or invalid answer: 0 points
- If all players leave except one, the remaining player wins automatically

A bot player (Alice) is available if no friends are online.

---

## Architecture

### Frontend
- Built with React + Vite
- Real-time UI updates
- Countdown timers
- Live scoreboard
- Persistent usernames (local storage)

### Backend Logic
- Game state machine (rounds, turns, timers)
- Bot logic with fairness constraints
- Score tracking
- Game creation and joining via game IDs

### Linera Integration (Planned / Partial)
- Game state is designed to map directly onto **Linera microchains**
- Intended mapping:
  - Player identity → Player microchain
  - Game session → Shared game microchain
  - Scores → On-chain leaderboard
- AI logic and word generation remain off-chain for performance reasons

Due to CLI version mismatches and local environment constraints, the validator node could not be fully deployed locally.
However, Linera CLI usage, validator configuration, and architecture design were attempted and documented.

---

## Demo
A live frontend demo is deployed on Vercel.

---

## Tech Stack
- React + Vite
- TypeScript
- Node.js
- Linera (CLI attempted, architecture-ready)
- AI-assisted bot logic

---

## Future Work
- Deploy smart contracts on Linera testnet
- Move game state fully on-chain
- On-chain leaderboard verification
- Multi-validator setup
- Wallet-based identity

---

## Notes
This project focuses on demonstrating **real-time interaction, microchain-oriented design, and scalability**, aligned with Linera’s vision.
